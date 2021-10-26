<script setup>
import classes from './RatingsCourseView.module.scss'
import VueApexCharts from "vue3-apexcharts";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import {onMounted, watch, ref} from "vue";


const store = useStore()
const route = useRoute()

watch(() => route.params.id, async newId => {
    if (route.name === 'RatingsCourse') await store.dispatch('setListEvents', newId)
})

//Открываем список лайков 
const openListUsersLike = async (item, id) => {
    if (id === 'all' || item.likes['like_' + id] !== 0) {
        await store.dispatch('setLikeEventUsers', {course_id: item.course_id, event_id: item.event_id, like: id})
        await store.dispatch('setOpenItem', item)
        await store.dispatch('setDialogWin', 'RatingsEvent')
    }
}

onMounted(async () => {
    await store.dispatch('setListEvents', route.params.id)
})

//Массив для графика
const chartOptions = {
    chart: {
        width: 100,
        type: 'donut',
    },
    plotOptions: {
        pie: {
            startAngle: -90,
            endAngle: 270
        }
    },
    fill: {
        //type: 'gradient',
    },
    colors: ['rgb(6, 153, 34)', 'rgb(88, 122, 176)', 'rgb(255, 112, 51)', 'rgb(208, 77, 77)'],
    labels: ['Я восхищен', 'Все нравится', 'Неоднозначно', 'Не понравилось'],
    dataLabels: {
        style: {
            fontSize: '12px',
            fontFamily: 'TensorFont',
            fontWeight: '100',
        },
    },
    legend: {
        position: 'right',
        fontFamily: 'TensorFont',
        horizontalAlign: 'center',
    }
}

</script>

<template>
    <div :class="classes.cont__view_course">
        <div :class="classes.title__section__rating">ОЦЕНКИ ЗА ТЕСТЫ</div>
        <div :class="classes.container_pue">
            <div :style="{width: 400 + 'px', height: 240 + 'px'}">
                <VueApexCharts
                      :options="chartOptions"
                      :series="store.getters.getChartLike"
                />
            </div>
        </div>
        <div>
            <div :class="classes.title__section__rating">
                <span>СРЕДНЯЯ ОЦЕНКА ЗА КУРС</span>
                <div
                      :class="'icon24_likes_' + store.getters.getAverageCourse"
                      :title="store.getters.getTitle(store.getters.getAverageCourse)"
                />
            </div>
        </div>

        <div :class="classes.list_events">
            <div :class="classes.list_events_wrraper">

                <div :class="classes.list_events_wrraper_header__table">
                    <div :class="classes.list_events_wrraper_header__table_wrap">
                        <div :class="classes.list_events_wrraper_header__table_wrap_col_title"></div>
                        <div v-for="(i, index) in store.getters.getLikesList"
                             :key="i.id"
                             :class="[classes.list_events_wrraper_header__table_wrap_col_like, i.icon + '_16']"
                             :title="i.title"
                        >
                            <span>{{ store.getters.getChartLike[index] }}</span>
                        </div>
                        <div :class="classes.list_events_wrraper_header__table_wrap_col_total">
                            <span :class="classes.list_events_wrraper_header__table_wrap_col_total_text">Всего</span>
                            <span :class="classes.list_events_wrraper_header__table_wrap_col_total_all">{{ store.getters.getAllCount }}</span>
                        </div>
                        <div :class="classes.list_events_wrraper_header__table_wrap_col_total">
                            <span :class="classes.list_events_wrraper_header__table_wrap_col_total_text">Средняя</span>
                            <span :class="classes.list_events_wrraper_header__table_wrap_col_total_all"></span>
                        </div>
                    </div>
                </div>

                <perfect-scrollbar :style="{height: store.getters.getHeightWin - 434 + 'px'}">
                    <div :class="classes.list_events_wrraper_content" v-for="i in store.getters.getListEvents">
                        <div :class="classes.list_events_wrraper_content_wrap">

                            <div :class="classes.list_events_wrraper_content_wrap_title" :title="i.title">{{ i.title }}</div>

                            <div :class="classes.list_events_wrraper_content_wrap_like"
                                 @click="openListUsersLike(i, 4)"
                            ><span>{{ i.likes['like_4'] }}</span></div>

                            <div :class="classes.list_events_wrraper_content_wrap_like"
                                 @click="openListUsersLike(i, 3)"
                            ><span>{{ i.likes['like_3'] }}</span></div>

                            <div :class="classes.list_events_wrraper_content_wrap_like"
                                 @click="openListUsersLike(i, 2)"
                            ><span>{{ i.likes['like_2'] }}</span></div>

                            <div :class="classes.list_events_wrraper_content_wrap_like"
                                 @click="openListUsersLike(i, 1)"
                            ><span>{{ i.likes['like_1'] }}</span></div>

                            <div :class="classes.list_events_wrraper_content_wrap_total" @click="openListUsersLike(i, 'all')">
                                <span>
                                {{ +i.likes['like_4'] + +i.likes['like_3'] + +i.likes['like_2'] + +i.likes['like_1'] }}
                                </span>
                            </div>
                            <div :class="classes.list_events_wrraper_content_wrap_total" title="Средняя оценка за элемент курса">
                                <div :class="'icon16_likes_' + Math.round((+(i.likes['like_4'] * 4) + (+i.likes['like_3'] * 3) + (+i.likes['like_2'] * 2) + +i.likes['like_1']) /
                                    (+i.likes['like_4'] +
                                     +i.likes['like_3'] +
                                     +i.likes['like_2'] + +i.likes['like_1']))"

                                />
                            </div>
                        </div>
                    </div>
                </perfect-scrollbar>


            </div>
        </div>

    </div>


</template>
