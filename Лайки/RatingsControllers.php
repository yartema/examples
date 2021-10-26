<?php

use Phpml\Clustering\FuzzyCMeans;


class RatingsController
{
    private $pgdb;
    private $mysql;
    private $module = array(
        '15' => 'mdl_page',
        '16' => 'mdl_quiz',
        '18' => 'mdl_scorm'
    );

    public function __construct() {
        $this->pgdb = new PgSQL;
        $this->mysql = new MySQL;
        $this->mysql->issue_query("SET NAMES 'utf8'");
    }

    /**
    * Получаем список курсов в который проставлены лайки
    */
    public function listCourses() {
        $result = $this->pgdb->fetchAll("SELECT DISTINCT 
                t1.course_id,
                (SELECT COUNT(t3.likes_id) AS count FROM likes_course t3 WHERE t3.course_id = t1.course_id) AS count
                FROM
                likes_course t1;");
        foreach ($result as $k => $v) {
            $re = $this->courseName($v['course_id']);
            $result[$k]['name'] = $re;
        }
        Response::sendResponse(200, $result);
    }

    /**
    * Получаем из MySQL названия курса
    */
    public function courseName($id) {
        
        $this->mysql->prepare_query("SELECT shortname FROM mdl_course WHERE id = ? LIMIT 1;");
        $re = $this->mysql->issue_query(array($id));
        if ($re) {
            $re = $this->mysql->fetch_array();
            return $re['shortname'];
        }
        else return 'Неизвестно';
    }
    /**
    * Получаем наименование мероприятия
    */
    public function eventName ($course_id, $event_id) {
        
        $this->mysql->prepare_query("SELECT
                instance,
                module
                FROM
                mdl_course_modules
                WHERE
                id = ? AND course = ? LIMIT 1");
        $re = $this->mysql->issue_query(array($event_id, $course_id));
        if ($re) {
            $row = $this->mysql->fetch_array();
            $instance = $row['instance'];
            $module = $row['module'];
            if ($this->module[$module]) {
                $this->mysql->prepare_query("SELECT `name` FROM {$this->module[$module]} WHERE id = ?;");
                $this->mysql->issue_query(array($instance));
                $row = $this->mysql->fetch_array();
                return $row['name'];
            } else {
                return 'Неизвестно';
            }

        } else {
            return 'Неизвестно';
        }
    }
    /**
    * Получаем по ID курсу оценки и мероприятия
    */
    public function getListEvent($params) {
        if ($params['course_id']) {
            $events = $this->pgdb->fetchAll("SELECT DISTINCT
                t1.course_id,
                t1.event_id
            FROM
            likes_course t1
            WHERE 
            t1.course_id = ?", [$params['course_id']]);
            if ($events) {
                Response::sendResponse(200, $this->getModule($events));
            }
        }
    }
    /**
    * Получаем из MySQL id модуля и название мероприятия
    */
    private function getModule($data) {
        if ($data) {
            $list = array();
            $db = new MySQL;
            foreach ($data as $k => $v) {
                $db->prepare_query("SELECT
                t1.instance,
                t1.module
                FROM
                mdl_course_modules t1
                WHERE
                t1.id = ? LIMIT 1");
                $re = $db->issue_query(array($v['event_id']));
                if ($re) {
                    $row = $db->fetch_array();
                    $data[$k]['instance'] = $row['instance'];
                    $data[$k]['module'] = $row['module'];
                }
            }
            foreach ($data as $k => $v) {
                if ($this->module[$v['module']]) {
                    $table = $this->module[$v['module']];
                    $db->prepare_query("SELECT `name` FROM {$table} WHERE id = ?;");
                    $db->issue_query(array($v['instance']));
                    $row = $db->fetch_array();
                } else {
                    $row['name'] = 'Неизвестно';
                }

                $a = array(
                    'title' => $row['name'],
                    'event_id' => $v['event_id'],
                    'course_id' => $v['course_id'],
                    'likes' => array (
                        'like_4' => 0,
                        'like_3' => 0,
                        'like_2' => 0,
                        'like_1' => 0
                    )
                );
                $re = $this->pgdb->fetchAll("SELECT 
                    likes_id, 
                    COUNT(likes_id) AS count 
                    FROM likes_course
                    WHERE event_id = ? AND course_id = ? 
                    GROUP BY (likes_id)", [$v['event_id'], $v['course_id']]);
                foreach($re as $v) {
                    $a['likes']['like_'.$v['likes_id']] = $v['count'];
                }

                array_push($list, $a);
            }
            return $list;
        }
    }
    /**
    *  Получаем определенные оценки или все оценки за мероприятия
    */

    public function LikesEventsUsers($params) {
        if ($params['like'] == 'all') {
            $query = "SELECT 
                likes_course_id,
                event_id,
                to_char(time_to_likes, 'dd.mm.yyyy hh24:mi:ss') AS like_date,
                user_id,
                likes_id,
                comment,
                to_char(comment_date, 'dd.mm.yyyy hh24:mi:ss') AS comment_date,
                comment_responsible 
            FROM likes_course WHERE course_id = ? AND event_id = ? ORDER BY time_to_likes DESC";
            $param = array($params['course_id'], $params['event_id']);
        } else {
            $query = "SELECT 
            likes_course_id,
            event_id,
            to_char(time_to_likes, 'dd.mm.yyyy hh24:mi:ss') AS like_date,
            user_id,
            likes_id,
            comment,
            to_char(comment_date, 'dd.mm.yyyy hh24:mi:ss') AS comment_date,
            comment_responsible 
            FROM likes_course WHERE course_id = ? AND event_id = ? AND likes_id = ? ORDER BY time_to_likes DESC";
            $param = array($params['course_id'], $params['event_id'], $params['like']);
        }
        $list = $this->pgdb->fetchAll($query, $param);

        foreach ($list as $k => $v) {
            $user = UserController::getIntoUser($v['user_id']);
            if ($user) {
                $list[$k]['name'] = $user['name'];
                $list[$k]['email'] = $user['email'];
            }
            if ($v['comment_responsible'] != null) {
                $user = UserController::getIntoUser($v['comment_responsible']);
                if ($user) {
                    $list[$k]['name_responsible'] = $user['name'];
                    $list[$k]['email_responsible'] = $user['email'];
                }
            }
        }
        Response::sendResponse(200, $list);
    }
    /**
    *  Записываем комментарий к лайку в БД
    */
    public function setCommentLike($params) {
        if ($params['user_id'] && $params['textComment']) {
            $likes_course_id = trim(strip_tags($params['likes_course_id']));
            $id = trim(strip_tags($params['user_id']));
            $text = trim(strip_tags($params['textComment']));
            date_default_timezone_set('Europe/Moscow');
            $this->pgdb->prepare_query("UPDATE 
            likes_course SET comment = ?, comment_responsible = ?,  comment_date = now() 
            WHERE likes_course_id = ?");
            $re = $this->pgdb->issue_query(array($text, (int)$id, $likes_course_id));
            if ($re) {
                $re = $this->pgdb->fetchAll("SELECT 
                to_char(comment_date, 'dd.mm.yyyy hh24:mi:ss') 
                AS comment_date 
                FROM likes_course WHERE likes_course_id = ?", [$likes_course_id]);
            }
            Response::sendResponse(200, $re);
        }
    }
    /**
     * Получаем лайки студента по курсу
     */
    public function getLikeUserCourse ($params) {
        if ($params['course_id'] && $params['user_id']) {
            $course_id = trim(strip_tags($params['course_id']));
            $user_id = trim(strip_tags($params['user_id']));

            $re = $this->pgdb->fetchAll("SELECT 
            likes_course_id,
            likes_id,
            course_id,
            event_id,
            time_to_likes
            FROM 
            likes_course 
            WHERE 
            course_id = ? AND user_id = ?;",
            [$course_id, $user_id]);
            if ($re) {
                Response::sendResponse(200, $re);
            } else {
                Response::sendResponse(404, ['error'=> Errors::messageError(404)]);
            }
        } else {
            Response::sendResponse(400, ['error'=> Errors::messageError(400)]);
        }
    }
    /**
    * Записываем в БД проставленный лайк студентом на Moodle
    */
    public function setLikeUserInCourse ($params) {
        if ($params['course_id'] && $params['event_id'] && $params['user_id'] && $params['like_id']) {
            $course_id = trim(strip_tags($params['course_id']));
            $event_id = trim(strip_tags($params['event_id']));
            $user_id = trim(strip_tags($params['user_id']));
            $like_id = trim(strip_tags($params['like_id']));
            $this->pgdb->prepare_query("INSERT INTO
            likes_course (course_id, event_id, user_id, likes_id)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (course_id, event_id, user_id) DO UPDATE SET likes_id = ?, time_to_likes = now()");
            $re = $this->pgdb->issue_query(array($course_id, $event_id, $user_id, $like_id, $like_id));
            if ($re) {
                Response::sendResponse(200);
            }
        } else {
         Response::sendResponse(400, ['error'=> Errors::messageError(400)]);
        }
    }

    /**
    * Получаем все лайки студента с названиями курса и мероприятиями
    */
    public function getUserAllLikes($params) {
        if ($params['user_id']) {
            $user_id = trim(strip_tags($params['user_id']));
            $list = array();
            $re = $this->pgdb->fetchAll("SELECT
                likes_course_id,
                course_id,
                event_id,
                likes_id,
                to_char(time_to_likes, 'dd.mm.yyyy hh24:mi:ss') AS like_date
            FROM
                likes_course
            WHERE
                user_id = ?", [$user_id]);
            if ($re) {
                foreach ($re as $k => $v) {
                    if (!$list[$v['course_id']]) {
                        $name = $this->courseName($v['course_id']);
                        $list[$v['course_id']] = array(
                            'course_id' => $v['course_id'],
                            'name' => $name,
                            'events' => array()
                        );
                        $event_name = $this->eventName($v['course_id'], $v['event_id']);
                        array_push($list[$v['course_id']]['events'], [
                            'event_id' => $v['event_id'],
                            'event_name' => $event_name,
                            'like_id' => $v['likes_id'],
                            'likes_course_id' => $v['likes_course_id'],
                            'like_date' => $v['like_date']
                        ]);

                    } else {
                        $event_name = $this->eventName($v['course_id'], $v['event_id']);
                        $a = array(
                            'event_id' => $v['event_id'],
                            'event_name' => $event_name,
                            'like_id' => $v['likes_id'],
                            'likes_course_id' => $v['likes_course_id'],
                            'like_date' => $v['like_date']
                        );
                        array_push($list[$v['course_id']]['events'], $a);
                    }
                }
                $data = array();
                foreach ($list as $v) {
                    array_push($data, $v);
                }
                Response::sendResponse(200, $data);
            } else {
                Response::sendResponse(200);
            }
        } else {
            Response::sendResponse(400, ['error'=> Errors::messageError(400)]);
        }
    }

    /**
    * Получаем проставленный лак студента в лекции
    */
    public function getLikeUserLesson ($params) {
        if ($params['course_id'] && $params['user_id'] && $params['event_id']) {
            $course_id = trim(strip_tags($params['course_id']));
            $user_id = trim(strip_tags($params['user_id']));
            $event_id = trim(strip_tags($params['event_id']));
            $re = $this->pgdb->fetchAll("SELECT 
            likes_id
            FROM
            likes_course
            WHERE
            course_id = ? AND user_id = ? AND event_id = ? LIMIT 1", [$course_id,$user_id, $event_id ]);
            if ($re) Response::sendResponse(200, $re);
            else Response::sendResponse(418, ['error'=> Errors::messageError(418)]);
        } else {
            Response::sendResponse(400, ['error'=> Errors::messageError(400)]);
        }
    }
}