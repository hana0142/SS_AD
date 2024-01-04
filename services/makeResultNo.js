const get_normal_check_no = async (user_id) => {
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    //var result_check_no = year + month + day + hour + minites + seconds;
    var result_normal_check_no = 'N_' + year + month + day + hour + minutes + seconds + '_' + user_id;
    return result_normal_check_no;
};

const get_simple_check_no = async (user_id) => {
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    //var result_check_no = year + month + day + hour + minites + seconds;
    var result_simple_check_no = 'S_' + year + month + day + hour + minutes + seconds + '_' + user_id;
    return result_simple_check_no;
}

const get_qt_no = async (user_id) => {
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    //var result_check_no = year + month + day + hour + minites + seconds;
    var result_qt_check_no = 'Q_' + year + month + day + hour + minutes + seconds + '_' + user_id;
    return result_qt_check_no;
}

module.exports = { get_normal_check_no, get_simple_check_no, get_qt_no };
