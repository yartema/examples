<script setup>
import classes from './RatingsStaffRowControl.module.scss'
import ModalWindow from '/src/components/BaseDialogWindow/BaseDialogWindow.vue'
import TextContentEditTable from '/src/components/BaseContentedittable/BaseContentedittable.vue'
import {defineProps, ref} from "vue";
import {useStore} from "vuex";
import queryFetch from "../../../hooks/queryFetch";

const store = useStore()

const props = defineProps({
    elem: Object
})


const isShowWinComment = ref(false)
const commentLikeValue = ref(props.elem.comment)
const showPoleText = ref(true)
const editIconShow = ref(false) 


//Открываем окно комментария к лайку
const openWinComment = (item) => {
    if (item.comment != null) {
        showPoleText.value = false
        editIconShow.value = true
    }
    isShowWinComment.value = true
    store.dispatch('setOpenCommentWin', item.likes_course_id)
}

//Закрываем окно комментария к лайку
const closeCommentWin = () => {
    isShowWinComment.value = false
    store.dispatch('setOpenCommentWin', '')
}

//Записываем комментарий
const setCommentLike = async (el) => {
    if (commentLikeValue.value.length > 0) {
        const re = await queryFetch('Ratings.setCommentLike', {
            textComment: commentLikeValue.value,
            user_id: store.getters.getUser.id,
            likes_course_id: el.likes_course_id
        })
        if (re) {
            store.getters.getLikesEvent.forEach(i => {
                if (i.likes_course_id === el.likes_course_id) {
                    i.comment = commentLikeValue.value
                    i.comment_date = re.data[0]['comment_date']
                    i.name_responsible = store.getters.getUser.name
                    i.comment_responsible = store.getters.getUser.id
                }
            })
            showPoleText.value = false
            editIconShow.value = true
        }
    }
}

//Редактируем комментарий
const editCommentLike = (el) => {
    showPoleText.value = true
    editIconShow.value = false
}

</script>

<template>
    <div :class="classes.panel_control__Likes">
        <div>
            <div v-if="!elem.comment" class="comment" title="Оставить комментарий"  @click="openWinComment(elem)">Оставить комментарий</div>
            <div v-else class="comment" title="Посмотреть комментарий"  @click="openWinComment(elem)">Комментарий</div>
            <ModalWindow
                v-if="isShowWinComment"
                :width="400"
                :style="{zIndex: 1, height:'auto'}"
                :closeStore="false"
                @isCloseDialog="closeCommentWin"
                :background="'#f8f8f8'"
                :title="'Комментарий'"
            >
                <template v-slot:control-panel>
                    <div class="icon_24_sbis icon-Edit"
                         v-if="store.getters.getUser.id === elem.comment_responsible && editIconShow"
                         title="Редактировать"
                         @click="editCommentLike(elem)"
                    />
                    <div
                        v-if="commentLikeValue?.length > 0 && commentLikeValue !== elem.comment"
                        class="btn_ok_jackdaw"
                        title="Сохранить"
                        @click="setCommentLike(elem)"
                    />
                </template>
                <template v-slot:body-content>
                    <div :class="classes.container_body__comment">
                        <div :style="{padding:12 + 'px'}">
                            <TextContentEditTable
                                v-if='showPoleText'
                                :placeholder="'Текст комментария'"
                                :maxlength="255"
                                v-model="commentLikeValue"
                                :height="72"
                            />
                            <div v-else>
                                {{commentLikeValue}}
                            </div>
                        </div>
                        <div :class='classes.info__date_comment'>
                            <span v-if='elem.name_responsible'>{{elem.name_responsible}}</span>
                            <span>{{elem.comment_date}}</span>
                        </div>
                    </div>
                </template>
            </ModalWindow>
        </div>
        <div :class="classes.panel_control__Likes_icon_blcok">
            <div :class="'icon24_likes_' + elem.likes_id" :title="store.getters.getTitle(elem.likes_id)"/>
        </div>
    </div>
    <div :class="classes.panel_control__Likes_date_like" title="Дата оценки">
        {{ elem.like_date.split(' ')[0] }}
    </div>
</template>
