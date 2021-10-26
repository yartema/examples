/**
 * Проверям что находимся на странице профиля
 * Если да, делаем запрос и получаем из шаблонизатора выданные навыки и рендарим на страницу
 */
 document.addEventListener('DOMContentLoaded', async function() {
    let doc = document
    if (document.location.pathname == '/user/profile.php') {

        let script = document.createElement('script')
        script.src = '../tensor/admin/general/plugins/calendar/calendar_tensor.js'
        document.getElementsByTagName('head')[0].appendChild(script);

        doc.getElementsByTagName("head")[0].insertAdjacentHTML(
            "beforeend",
            "<link rel=\"stylesheet\" href=\"../tensor/admin/general/styles/profile_user.css\" />" +
            "<link rel=\"stylesheet\" href=\"../tensor/admin/general/plugins/calendar/calendar_tensor.css\" />")


        let id = doc.location.search.split('=')[1]

        let url = '../tensor/admin/re_badges.php' + "?action=user_profile_badges" + "&id=" + id
        let re = await fetch(url)
        if (re.ok) {
            let html = await re.text()
            let p = doc.querySelector('.profile_tree')
            let cont = doc.createElement('div')
            cont.className = 'conteiner-list-badges'
            cont.innerHTML = html
            p.insertBefore(cont, p.firstChild)
        }
    }

})

/**
 * Кнопака плюс - выдать навык
 */

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn-plus')) {
        open_menu_issue_badge()
    } else {
        close_menu_add_badge()
    }
})

/**
 * 
 * @param {user_id} id - открываем выданный навык для просмотра 
 */

async function open_badge_user(id) {
    if (document.querySelector('.conteiner-badge-win-module') != null) {
        close_badge_win_module()
    }
    let url = '../tensor/admin/re_badges.php' + "?action=open_badge_in_profile" + "&id=" + id
    let re = await fetch(url)
    if (re.ok) {
        let html = await re.text()
        document.querySelector('#page').innerHTML += html
    }
}

/**
 * Заркуваем всплывающее меню
 */

function close_modal_win_issue_badge() {
    if (document.querySelector('.modal_win_issue_badge') != null) {
        document.querySelector('.modal_win_issue_badge').remove()
    }
}

/**
 * 
 * @param {Html elemet} e
 * Получаем шаблон календаря из шаблонизатора
 * Окрываем календарь 
 */

async function open_calendar(e) {
    if (document.querySelector('.conteiner_calendar') == null) {
        let url = '/tensor/admin/re_badges.php' + "?action=open_calendar"
        let re = await fetch(url)
        if (re.ok) {
            let html = await re.text()
            let p = e.parentElement
            let div = document.createElement('div')
            div.className = 'conteiner_calendar'
            div.innerHTML = html
            p.append(div)
            calendar_open()
        }
    }
}

/**
 * 
 * @param {*} id 
 * Записываем выданный навык в БД
 * @returns 
 */

async function save_add_badge(badge_id) {
    let doc = document
    let comm = doc.querySelector('.comment-badge-text').value
    let date = doc.querySelector('[data-badge="data_issue_badge"]')

    let arrD = date.value.split('.');
    arrD[1] -= 1;
    var d = new Date(arrD[2], arrD[1], arrD[0]);

    if ((d.getFullYear() == arrD[2]) && (d.getMonth() == arrD[1]) && (d.getDate() == arrD[0])) {
        date = new Date()
        date = arrD[2] + '-' +
            ('00' + (arrD[1] + 1)).slice(-2) + '-' +
            ('00' + arrD[0]).slice(-2) + ' ' +
            ('00' + '07').slice(-2) + ':' +
            ('00' + '30').slice(-2) + ':' +
            ('00' + '00').slice(-2);
    } else {
        date.classList.add('no_date')
        return
    };
    let user_id = doc.querySelector('.name_user_text').dataset.id

    var data = {
        'action': 'issue_badge',
        'badge_id': badge_id,
        'comm': comm,
        'date': date,
        users: []
    }

    data.users.push(user_id)

    let response = await fetch('/tensor/admin/re_badges.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    })
    if (response.ok) {
        let re = await response.text();
        if (re == true) {
            location.reload()
        } else {
            doc.querySelector('.modal_win_issue_badge').insertAdjacentHTML('afterbegin', re)
        }
    }
}

/**
 * Закрываем модульное окно
 */

function close_modal_win() {
    if (document.querySelector('.modal_win') != null) {
        document.querySelector('.modal_win').remove()
    }
}

function close_badge_win_module() {
    let div = document.querySelector('.conteiner-badge-win-module')
    div.parentElement.removeChild(div)
}

/**
 * 
 * @param {*} e 
 * Создаем окно выдачи или редактирования навыка
 * @returns 
 */

function create_badge_user_admin(e) {
    let doc = document
    if (e.dataset.type == 'create') {
        e.innerText = 'Сохранить'
        e.setAttribute('data-type', 'save')


        let b_date = doc.querySelector('.block-date-gave-badge')
        let date = doc.querySelector('.pole-date-issued').innerText
        while (b_date.firstChild) {
            b_date.removeChild(b_date.firstChild)
        }

        let div = doc.createElement('div')
        div.className = 'row-div-inp-colendar'
        let content = '<span class="text-issue-calendar">Выдан</span>';
        content += '<input type="text" class="input-date-calendar" data-badge="data_issue_badge" value="' + date + '" maxlength="10" onKeyPress="cislo(this)" spellcheck="true" autocapitalize="off" inputmode="decimal" autocomplete="off" tabindex="0" pattern="[0-9]{1,5}" >'
        content += '<div class="div-input-date-calc">&ensp;&ensp;.&ensp;&ensp;.&ensp;&ensp;&ensp;&ensp;</div>'
        content += '<div class="icon-btn-calendar" onClick="open_calendar(this)" title="Октрыть календарь">'
        content += '<svg class="controls-Input-DatePicker__button controls-Input-DatePicker__button controls-icon_style-secondary" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 21 21" xml:space="preserve" style="">'
        content += '<g xmlns="http://www.w3.org/2000/svg">'
        content += '<g xmlns="http://www.w3.org/2000/svg">'
        content += '<path class="st0" d="M19.7,2.7H21v18.1H0V2.7h2.6V0.1h1.3v2.6h1.3V0.1h1.3v2.6h7.9V0.1h1.2v2.6H17V0.1h1.3v2.6H19.7z M19.7,19.6V4 h-1.3v1.3h-1.3V4h-1.4v1.3h-1.2V4H6.6v1.3H5.3V4H3.9v1.3H2.6V4H1.3v15.6H19.7z M2.6,6.6v1.3h5.3V6.6H2.6z M2.6,10.5h1.3V9.3H2.6 V10.5z M2.6,13.1h1.3v-1.3H2.6V13.1z M2.6,15.8h1.3v-1.3H2.6V15.8z M2.6,18.3h1.3V17H2.6V18.3z M5.3,10.5h1.3V9.3H5.3V10.5z M5.3,13.1h1.3v-1.3H5.3V13.1z M5.3,15.8h1.3v-1.3H5.3V15.8z M5.3,18.3h1.3V17H5.3V18.3z M7.9,10.5h1.3V9.3H7.9V10.5z M7.9,13.1 h1.3v-1.3H7.9V13.1z M7.9,15.8h1.3v-1.3H7.9V15.8z M7.9,18.3h1.3V17H7.9V18.3z M10.5,9.3v1.3h1.3V9.3H10.5z M10.5,11.8v1.3h1.3 v-1.3H10.5z M10.5,14.4v1.3h1.3v-1.3H10.5z M13.1,10.5h1.3V9.3h-1.3V10.5z M13.1,13.1h1.3v-1.3h-1.3V13.1z M13.1,15.8h1.3v-1.3 h-1.3V15.8z M15.7,10.5h2.7V9.3h-2.7V10.5z M15.7,13.1h2.7v-1.3h-2.7V13.1z M15.7,15.8h2.7v-1.3h-2.7V15.8z" xmlns="http://www.w3.org/2000/svg">'
        content += '</path></g></g></svg></div>'
        div.innerHTML += content
        b_date.append(div)

        let block = doc.querySelector('.text-comment-badge-user')
        let comm = block.innerText
        block.textContent = '';
        let cont = doc.createElement('textarea')
        cont.className = 'comment-badge-text'
        cont.setAttribute('placeholder', 'Описание')
        cont.setAttribute('maxlength', '255')
        cont.setAttribute('rows', '6')
        cont.setAttribute('style', 'width: 95%')
        cont.value = comm
        block.append(cont)
    } else {

        let data = {
            'action': 'update_badge_profile',
            'badge_id': e.dataset.badge_id,
            'id': e.dataset.id,
            'up': {}
        }

        let date = doc.querySelector('[data-badge="data_issue_badge"]')

        let arrD = date.value.split('.')
        arrD[1] -= 1;
        var d = new Date(arrD[2], arrD[1], arrD[0])

        if ((d.getFullYear() == arrD[2]) && (d.getMonth() == arrD[1]) && (d.getDate() == arrD[0])) {

            date = new Date()
            date = arrD[2] + '-' +
                ('00' + (arrD[1] + 1)).slice(-2) + '-' +
                ('00' + arrD[0]).slice(-2) + ' ' +
                ('00' + '07').slice(-2) + ':' +
                ('00' + '30').slice(-2) + ':' +
                ('00' + '00').slice(-2);
        } else {
            date.classList.add('no_date')
            return
        };

        let b_text = doc.querySelector('.comment-badge-text')
        let text = b_text.value
        data.up.comment = text
        data.up.date_of_issue = date

        b_text.parentElement.removeChild(b_text)
        doc.querySelector('.text-comment-badge-user').innerText = text

        let cal = doc.querySelector('.row-div-inp-colendar')
        cal.remove()


        e.innerText = 'Изменить'
        e.setAttribute('data-type', 'create')
        update_edit_badge(data)
    }
}

// /**
//  * 
//  * @param {*} id 
//  * 
//  */

// async function extend_badge(id) {
//     var doc = document
//     let url = '../tensor/admin/re_badges.php' + "?action=extend_badge" + "&id=" + id
//     let re = await fetch(url)
//     if (re.ok) {
//         let period = await re.json()
//         let cont = doc.querySelector('.pole-date-issued')
//         cont.innerText = period.current_date
//         cont.setAttribute('data-status', 'new_date')
//         doc.querySelector('.date-pole-proceed').innerText = period.new_date
//     }
// }

/**
 * 
 * @param {*} data
 * Обновляем редактируемый навык 
 */

async function update_edit_badge(data) {
    let doc = document
    let response = await fetch('../tensor/admin/re_badges.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    })
    let re = await response.json()

    let end_date = 'до ' + re.end_date
    if (re.validity_period == 127) {
        end_date = 'бессрочно'
    }

    let div = `
    <div class="text-date-gave-badge">
        <span>Выдан</span>
        <div class="pole-date-issued">
        ${re.date_of_issue}
        </div>
    </div>

    <div class="text-date-gave-badge">
        <span>Действует</span>
        <div class="date-pole-proceed">
        ${end_date}
        </div>
        
    </div>`;

    doc.querySelector('.block-date-gave-badge').innerHTML += div

}

/**
 * Открываем меню списка навыков
 */

async function open_menu_issue_badge() {
    if (document.querySelector('.add-btn-plus') != null) {
        let url = "../tensor/admin/re_badges.php" + "?action=open_menu_issue_badge"
        let re = await fetch(url)
        if (re.ok) {
            let html = await re.text()
            let div = document.createElement('div')
            div.className = 'badge-menu'
            div.innerHTML = html
            document.querySelector('.block-title-profile-badge').append(div)
        }

        let li = document.querySelectorAll('.block-line-menu-badge')
        li.forEach((e) => {
            e.addEventListener('click', issue_badge_user)
        })
    }
}

/**
 * Открываем модульное окно с выбранным навыком
 */

async function issue_badge_user() {
    let id = this.dataset.badge
    let user = document.location.search.split('=')[1]

    let url = "../tensor/admin/re_badges.php" + "?action=profile_issue_badge" + "&user=" + user + "&badge=" + id
    let re = await fetch(url)
    if (re.ok) {
        let html = await re.text()
        document.querySelector('#page').innerHTML += html
    }
}

function close_menu_add_badge() {
    if (document.querySelector('.badge-menu') != null) {
        document.querySelector('.badge-menu').remove()
    }
}