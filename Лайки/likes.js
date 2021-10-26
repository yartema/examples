
//Отправляем запрос на сервер
const queryFetch = async (method, params = {}) => {
    if (method) {
        const key = '8pc83m5tuhoe1ati6ke24btk6v'
        const response = await fetch('https://fix-edu.tensor.ru/api/api.php', {
            method: 'POST',
            header: {
                'Accept': 'application/json',
            },
            //credentials: 'include',
            body: JSON.stringify({method, key, params})
        })
        if (response.ok) {
            return await response.json()
        }
    }
}

/**
 * Класс для лаков на странице курса
 */

class Likes {

    static select

    constructor(data, elems) {
        this.c_id = course_id
        this.data = data
        this.elems = elems
        this.title = {
            4: 'Я восхищен',
            3: 'Все нравится',
            2: 'Неоднозначно',
            1: 'Не понравилось'
        }
    }

    /**
    * Рендер лайков
    */
    
    renderLike() {
        this.openLike()
        if (!this.data.error) {
            this.data.map(i => {
                this.elems.forEach((e) => {
                    if(e.dataset.event == i.event_id) {
                        e.innerText = ''
                        e.setAttribute('data-like', i.likes_id)
                        e.setAttribute('title', this.title[i.likes_id])
                    }
                })
            })
            this.averageRating()
        }
    }

    /**
    * Делаем запрос на сервер и получаем html разменку окна лайков
    */

    openLike() {
        this.elems.forEach((e) => {
            e.addEventListener('click', async () => {
                this.closeWin()
                let el = event.target
                let re = await fetch("../tensor/admin/re_ratings.php" + "?action=get_win_likes" + "&id=" + el.dataset.event)
                if (re.ok) {
                    let html = document.createElement('div')
                    html.innerHTML = await re.text()
                    el.insertAdjacentElement('beforeBegin', html)
                    html.style.marginLeft = (e.clientWidth/2 - 50) + 'px'
                    // html.style.marginLeft = '-38px'
                    this.select = el.dataset.like
                    this.estimate(html)
                }
            })
        })
    }

    /**
     * 
     * @param element html 
     * Следим за кликом по лайку и записываем проставленный лайк в БД
     */

    estimate(html) {
        html.addEventListener('click', async () => {
            let el = event.target
            if (el.dataset.type == 'close') {
                this.closeWin()
            }
            if (el.dataset.type == 'like') {
                let id = el.dataset.smile
                if (id == this.select) {
                    this.closeWin()
                    return
                }
                let event_id = el.dataset.id
                const params = {
                    course_id: c_id,
                    event_id: event_id,
                    like_id: id,
                    user_id: user_id
                }
                let re = await queryFetch('Ratings.setLikeUserInCourse', params)
                if (!re.data.error) {
                    this.elems.forEach((e) => {
                        if (e.dataset.event == event_id) {
                            e.innerText = ''
                            e.setAttribute('data-like', id)
                            this.closeWin()
                            this.averageRating()
                        }
                    })
                }
            }
        })
    }

    /**
    * Закрываем окно выбора лайков
    */

    closeWin() {
        if (document.querySelector('.podskazka-bottom') != null) {
            document.querySelector('.podskazka-bottom').parentElement.remove()
        }
    }
    /**
     * Считаем средний лайк
     */
    averageRating() {
        let rating = 0
        let col = 0
        this.elems.forEach((e) => {
            if(/^[1-9]\d*$/.test(e.dataset.like) == true) {
                rating = +rating + +e.dataset.like
                col++
            }
        })
        if (rating > 0) {
            rating = Math.round(rating / col)
            let div = document.createElement('div')
            div.className = 'line_ave';
            let block = document.querySelector('#average_rating')
            block.classList.add('fb_less')
            let cont = `
                <span class="text-likes-user">Средняя оценка: </span>
                <div style="width: 32px; margin-left: 3px;" class="likes_res" data-like="${rating}" title="${this.title[rating]}"></div>
            `
            block.innerHTML = cont
            block.insertAdjacentElement('beforebegin', div)
            div.appendChild(block)
        }
    }
}


/**
* Проверяем что находимся на странице курса
* Находим все элементы для лайков
* Если нашли делаем запрос к api и получаем лоайки по параметрам
* course_id = курс на который зашли
* user_id = сотрудник который зашел на страницу курса 
*/

document.addEventListener('DOMContentLoaded', async () => {
    if (document.location.pathname == '/course/view.php') {
        let elems = document.querySelectorAll('.test_like')
        if (elems.length > 0) {
            const params = {
                course_id: course_id,
                user_id: user_id
            }
            const re = await queryFetch('Ratings.getLikeUserCourse', params)
            if (re) {
                const like = new Likes(re.data, elems)
                like.renderLike()
            }
        }
    }
})