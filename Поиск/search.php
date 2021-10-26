<?php
require_once('../../config.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/tensor/lib/shared.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/tensor/admin/translit.php');

/**
 * Класс для поиска в БД по введенному тексту 
*/

class Search {
    private $table = array(
        'test' => 'mdl_quiz',
        'course' => 'mdl_course',
        'student' => 'mdl_user',
        'module' => 'mdl_page'
    );

    private $db;
    private $text;
    private $were;
	private $admins;
    private $user_id;

    public function __construct($user_id, $admins) {
        global $dbMySQL;
        $this->db = $dbMySQL;
		$this->admins = explode(',', $admins);
        $this->user_id = strval($user_id);
    }

    /**
     * Функция запроса в БД для поиска курса
     * Принимает строку ($text)
    */

    public function course($text) {
        $text = '%'.$text.'%';
        $this->db->prepare_query("SELECT * FROM mdl_course WHERE fullname LIKE ? ;");
        $this->db->issue_query(array($text));
        $list = array();
        while ($row = $this->db->fetch_array()) {
            $data = array(
                'id' => $row['id'],
                'name' => $row['fullname'],
                'link' => '/course/view.php?id='.$row['id'],
            );
            array_push($list, $data);
        }
        return $list;
    }

    /**
     * Функция запроса в БД для поиска студента
     * Принимает массив
     * [0] = lastname
     * [1] = firstname
     * 
    */

    public function user($data) {
        $last = $data['lastname'];
        $last = '%'.$last.'%';
        $first = $data['firstname'];
        $first = '%'.$first.'%';
        $this->db->prepare_query("SELECT * FROM mdl_user WHERE `lastname` LIKE ? AND `firstname` LIKE ? ;");
        $this->db->issue_query(array($last, $first));
        $list = array();
        while ($row = $this->db->fetch_array()) {
            $u = array(
                'id' => $row['id'],
                'name' => $row['lastname'] . ' ' . $row['firstname'],
                'email' => $row['email'],
                'link' => '/user/profile.php?id='.$row['id']
            );
            array_push($list, $u);
        }
        return $list;
    }

    /**
     * Функция запроса в БД для поиска теста
     * Принимает строку ($text)
    */

    public function test($text) {
        $text = '%'.$text.'%';
        $this->db->prepare_query("SELECT * FROM mdl_quiz WHERE `name` LIKE ? ;");
        $this->db->issue_query(array($text));
        $list = array();
        while ($row = $this->db->fetch_array()) {
            $data = array(
                'id' => $row['id'],
                'c_id' => $row['course'],
                'name' => $row['name']
            );
            array_push($list, $data);
        }
        foreach ($list as $k => $v) {
            $this->db->prepare_query("SELECT fullname FROM mdl_course WHERE id = ? LIMIT 1;");
            $re = $this->db->issue_query(array($v['c_id']));
            if ($re == true) {
                while ($re = $this->db->fetch_array()) {
                    $list[$k]['course'] = $re['fullname'];
                }
            }
            $this->db->prepare_query("SELECT id, visibleoncoursepage FROM mdl_course_modules WHERE instance = ? AND module = 16 LIMIT 1;");
            $re = $this->db->issue_query(array($v['id']));
            if ($re == true) {
                while ($re = $this->db->fetch_array()) {
                    $list[$k]['test_id'] = $re['id'];
					$list[$k]['visibl'] = $re['visibleoncoursepage'];
                    $list[$k]['link'] = '/mod/quiz/view.php?id='.$re['id'];
                }
            }
        }
        if (!in_array($this->user_id, $this->admins)) {
            $list_v = array();
            foreach ($list as $k => $v) {
                if ($v['visibl'] != 1) {
                    array_push($list_v, $v);
                }
            }
            return $list_v;
        } else {
            return $list;
        }
    }

    /**
     * Функция запроса в БД для поиска модуля
     * Принимает строку ($text)
    */

    public function module($text) {
        $text = '%'.$text.'%';
        $this->db->prepare_query("SELECT * FROM mdl_page WHERE `name` LIKE ?;");
        $this->db->issue_query(array($text));
        $list = array();
        while ($row = $this->db->fetch_array()) {
            $data = array(
                'id' => $row['id'],
                'c_id' => $row['course'],
                'name' => $row['name']
            );
            array_push($list, $data);
        }
        foreach ($list as $k => $v) {
            $this->db->prepare_query("SELECT fullname FROM mdl_course WHERE id = ? LIMIT 1;");
            $re = $this->db->issue_query(array($v['c_id']));
            if ($re == true) {
                while ($re = $this->db->fetch_array()) {
                    $list[$k]['course'] = $re['fullname'];
                }
            }
            $this->db->prepare_query("SELECT id FROM mdl_course_modules WHERE instance = ? AND module = 15 LIMIT 1;");
            $re = $this->db->issue_query(array($v['id']));
            if ($re == true) {
                while ($re = $this->db->fetch_array()) {
                    $list[$k]['test_id'] = $re['id'];
                    $list[$k]['link'] = '/mod/page/view.php?id='.$re['id'];
                }
            }
        }
        return $list;
    }
}


/**
* Получаем GET запрос *
*/

if ($_GET) {
    if ($_GET['action'] == 'search') {
        $text = strip_tags(trim($_GET['text'])); //Убираем пробелы и теги
        $were = strip_tags(trim($_GET['were'])); //Убираем пробелы и теги
        $text = translit($text); //Делаем транслит с английского на русский
        $query = new Search($USER->id, $CFG->siteadmins);
        if ($were == 'course') {
            $re = $query->course($text);
            echo json_encode($re,JSON_UNESCAPED_UNICODE);
        }
        if ($were == 'student') {
            $text = explode(' ', $text);
            $last = $text[0];
            $first = $text[1];
            $data = array(
                'lastname' => $last,
                'firstname' => $first

            );
            $re = $query->user($data);
            echo json_encode($re,JSON_UNESCAPED_UNICODE);
        }
        if ($were == 'test') {
            $re = $query->test($text);
            echo json_encode($re,JSON_UNESCAPED_UNICODE);
        }
        if ($were == 'module') {
            $re = $query->module($text);
            echo json_encode($re,JSON_UNESCAPED_UNICODE);
        }
    }
}

