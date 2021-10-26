//Шаблоны html для модульного окна 
const getTemplate = (data, type) => {
    const items = data.map(item => {
        if (type == false) {
            if (item.check == 1) {
                return `
					<div class="checkbox-search-param cont-search">
						<label class="checkbox-label-search cont-search" for="check-${item.type}">
							<div class="checkbox-conteiner-search cont-search">
								<input type="radio" name="radio" id="check-${item.type}" data-type="${item.type}" class="input-hide cont-search" checked>
								<div class="cont-icon-checkbox cont-search" data-checked="1"></div>
								<div class="title-text-checkbox cont-search">${item.name}</div>
							</div>
						</label>
					</div>
				`
            } else {
                return `
					<div class="checkbox-search-param cont-search">
						<label class="checkbox-label-search cont-search" for="check-${item.type}">
							<div class="checkbox-conteiner-search cont-search">
								<input type="radio" name="radio" id="check-${item.type}" data-type="${item.type}" class="input-hide cont-search">
								<div class="cont-icon-checkbox cont-search" data-checked="0"></div>
								<div class="title-text-checkbox cont-search">${item.name}</div>
							</div>
						</label>
					</div>
				`
            }
        } else {
            if (item.type == type) {
                return `
				<div class="checkbox-search-param cont-search">
					<label class="checkbox-label-search cont-search" for="check-${item.type}">
						<div class="checkbox-conteiner-search cont-search">
							<input type="radio" name="radio" id="check-${item.type}" data-type="${item.type}" class="input-hide cont-search" checked>
							<div class="cont-icon-checkbox cont-search" data-checked="1"></div>
							<div class="title-text-checkbox cont-search">${item.name}</div>
						</div>
					</label>
				</div>
			`
            } else {
                return `
					<div class="checkbox-search-param cont-search">
						<label class="checkbox-label-search cont-search" for="check-${item.type}">
							<div class="checkbox-conteiner-search cont-search">
								<input type="radio" name="radio" id="check-${item.type}" data-type="${item.type}" class="input-hide cont-search">
								<div class="cont-icon-checkbox cont-search" data-checked="0"></div>
								<div class="title-text-checkbox cont-search">${item.name}</div>
							</div>
						</label>
					</div>
				`
            }
        }

    })
    return `
		<div class="cont-block-modal-search cont-search">
			<div class="wrap-block-modal-search cont-search" style="box-shadow: 0 0 6px 0 rgb(0 0 0 / 35%);">
				<div class="control-panel-saerch cont-search">
                    <div class="block-close-modal-win-search" title="Закрыть">
                        <span class="icon-close-win-search"></span>
                    </div>
				</div>
				<div class="content-search-win-top-panel cont-search">
                    <div class="block-settings-search-list cont-search">
                    
                    	${items.join('')}

                    </div>
                    <div class="content-search-list cont-search">
						<span class="text-list-content cont-search">Введите текст для поиска</span>
                    </div>
				</div>
			</div>
		</div>
	`
}

//Функция рендера списка найденых курсов
const renderCourses = (list) => {
    const cont = list.map(item => {
        return `
			<a href="${item.link}" class="line-result-search" target="_blank" title="${item.name}">
				<span class="name-pole-search">${item.name}</span>
				<span class="number-pole-search">(${item.id})</span>
			</a>
		`
    })
    return cont.join('')
}

//Функция рендера списка найденых сотрудников
const renderStudents = (list) => {
    const cont = list.map(item => {
        return `
			<a href="${item.link}" class="line-result-search" target="_blank" title="${item.name}">
				<span class="name-pole-search">${item.name}</span>
				<span class="number-pole-search">(${item.id})</span>
				<span class="number-pole-search">${item.email}</span>
			</a>
		`
    })
    return cont.join('')
}


//Функция рендера списка найденых тестов
const renderTests = (list) => {
    const cont = list.map(item => {
        return `
			<a href="${item.link}" class="line-result-search wrap" target="_blank" title="${item.name}">
				<div style="display: flex; flex-direction: row; align-items: center;">
					<span class="name-pole-search">${item.name}</span>
					<span class="number-pole-search">(${item.test_id})</span>
				</div>
				<span class="number-pole-search" style="margin-left: 0px;">Курс: ${item.course}</span>
			</a>
		`
    })
    return cont.join('')
}

//Класс строки поиска
class Search {

    constructor() {
        this.parent = document.querySelector('.block-search-tensor')
        this.inp = document.querySelector('.input-tensor-search')
        this.btn = document.querySelector('.input-btn-clear')
        this.thread = null;
        this.delayms = 1000;
        this.type = false;
        this.data = [
            { type: 'course', name: 'Курс', check: 1 },
            { type: 'student', name: 'Студент', check: 0 },
            { type: 'test', name: 'Тест', check: 0 },
            { type: 'module', name: 'Модуль', check: 0 }
        ]
    }

    //Рендер строки поиска
    render() {
        if (this.parent.querySelector('.cont-block-modal-search') == null) {
            const re = getTemplate(this.data, this.type)
            this.parent.insertAdjacentHTML('afterbegin', re)
        }
    }

    //Следим за фокусом на строку поиска и вывдим модеульное окно
    open() {
        this.inp.addEventListener('focus', () => {
            this.render()

        })
        document.addEventListener('click', event => {
            if (!event.target.classList.contains('cont-search')) {
                this.close()
            }
            if (event.target.classList.contains('icon-btn-search-tensor')) {
                this.render()
                document.querySelector('.input-tensor-search').focus()
            }
            if (event.target.classList.contains('input-btn-clear')) {
                this.clear_input()
                document.querySelector('.input-tensor-search').focus()
            }
            if (event.target.classList.contains('input-hide')) {
                this.no_check()
                this.check(event.target);
            }
        })
        this.inp.addEventListener('keyup', () => {
            this.render()
            clearTimeout(this.thread)
            if (event.target.value.length > 0) this.btnShow()
            if (event.target.value.length == 0) this.btnHide()
            if (event.target.value.length < 2) {

                this.parent.querySelector('.content-search-list').innerHTML = '<span class="text-list-content cont-search">Введите текст для поиска</span>'
            }
            if (event.target.value.length > 2) {
                let text = event.target.value
                this.get_search(text)
            }
        })
    }

    //Функция запроса на сервер, принимает введенный тест в строку поиска
    get_search(text) {
        if (text.length > 2) {
            this.load_icon()
            this.thread = setTimeout(async function search() {
                text = text.replace(/( |^)[а-яёa-z]/g, function(u) {
                    return u.toUpperCase()
                })
                let inputs = document.querySelectorAll('.input-hide')
                let type = '';
                inputs.forEach((e) => {
                    if (e.checked) {
                        type = e.dataset.type
                    }
                })
                let url = "/tensor/admin/search.php" + "?action=search" + "&text=" + text + "&were=" + type
                let response = await fetch(url)

                if (response.ok) {
                    let list = await response.json()
                    if (list.length == 0) {
                        document.querySelector('.content-search-list').innerHTML = '<span class="text-list-content cont-search">Записей не найдено</span>'
                    } else {
                        let cont
                        if (type == 'course') {
                            cont = renderCourses(list)
                        }
                        if (type == 'student') {
                            cont = renderStudents(list)
                        }
                        if (type == 'test' || type == 'module') {
                            cont = renderTests(list)
                        }
                        document.querySelector('.content-search-list').innerHTML = cont
                    }

                }
            }, this.delayms)
        }
    }

    //Функция клика выбора параметра запроса
    check(e) {
        let icon = e.parentElement.children[1]
        icon.setAttribute('data-checked', '1')
        this.type = e.dataset.type
        this.inp.focus()
        this.get_search(this.inp.value)
    }

    //Переключаем атрибут data-checked на 0
    no_check() {
        this.parent.querySelector('[data-checked="1"]').setAttribute('data-checked', '0')
    }

    //Закрываем модульное окно
    close() {
        if (this.parent.querySelector('.cont-block-modal-search') != null) {
            this.parent.querySelector('.cont-block-modal-search').remove()
        }
    }
    //Иконка загрузки
    load_icon() {
        let cont = `
			<div style="justify-content: center; display: flex;">
				<img class="text-list-content cont-search" style="padding:0;height:24px; width:24px;"src="/tensor/admin/general/img/loader.gif"></img>
			</div>`
        this.parent.querySelector('.content-search-list').innerHTML = cont
    }

    //Показываеи крестик который стирает текст
    btnShow() {
        this.btn.setAttribute('data-stat', 'show')
    }
    //Скрываем крестик который стирает текст
    btnHide() {
        this.btn.setAttribute('data-stat', 'hiden')
    }

    //Очищаем строку поиска
    clear_input() {
        this.inp.value = ''
        this.btnHide()
    }
}


//После загрузки дома проверяем есть ли навбар на странице, если есть рендарим строку поиска
document.addEventListener('DOMContentLoaded', () => {

    if (document.querySelector('[aria-label="Навигация по сайту"]') != null) {
        let navbar = document.querySelector('[aria-label="Навигация по сайту"]')
        let div = navbar.children[3]

        let input = document.createElement('div')
        input.className = "block-search-tensor cont-search"
        input.innerHTML = `
			<input placeholder="Найти..." class="input-tensor-search cont-search" autocomplete="off" title="Введите для поиска">
			<span class="input-btn-clear" title="Стереть" data-stat="hiden"></span>
			<span class="icon-btn-search-tensor cont-search"></span>
		`
        navbar.insertBefore(input, div)
        const inp = new Search()
        inp.open()
    }

})