// +----------------------------------------------------------------------
// | gas-web [JUST DO IT]
// +----------------------------------------------------------------------
// | Author     : Kangaroo
// +----------------------------------------------------------------------
// | Date       : 2018-11-09 14:29
// +----------------------------------------------------------------------
// | Description: 公共函数方法
// +----------------------------------------------------------------------

const Functions = {

    /**
         * 获取对应文件类型样式
         * @param fileType
         */
    getFileClass(fileType) {

        if ('jpg,jpeg,bmp,gif,png,tif'.indexOf(fileType) >= 0) {
            return 'file image';
        }

        if ('doc,docx,txt,rtf,wps'.indexOf(fileType) >= 0) {
            return 'file powerpoint ';
        }

        if ('xls,xlsx'.indexOf(fileType) >= 0) {
            return 'file excel ';
        }

        if ('ppt,pptx'.indexOf(fileType) >= 0) {
            return 'file powerpoint ';
        }

        if ('pdf'.indexOf(fileType) >= 0) {
            return 'file pdf ';
        }

        if ('zip,rar,7z'.indexOf(fileType) >= 0) {
            return 'file archive ';
        }

        if ('dwg,dws,dwt,dxf'.indexOf(fileType) >= 0) {
            return 'file alternate ';
        }

        return '';
    },

    /**
         * 获取对应分类允许上传的文件扩展
         * @param category 分类，例如：excel，ppt，pdf，zip等
         */
    getFileExtension(category) {

        let extension = '';

        switch (category) {
        case 'image':
            extension = '.jpg,.jpeg,.bmp,.gif,.png';
            break;
        case 'dwg':
            extension = '.dwg,.dws,.dwt,.dxf';
            break;
        case 'excel':
            extension = '.xls,.xlsx';
            break;
        case 'ppt':
            extension = '.ppt,.pptx';
            break;
        case 'pdf':
            extension = '.pdf';
            break;
        case 'word':
            extension = '.doc,.docx,.txt,.rtf,.wps';
            break;
        case 'zip':
            extension = '.zip,.rar,.7z';
            break;
        default:
            extension = '.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.bmp,.gif,.tif,.png,.txt,.rtf,.wps,.dwg,.dws,.dwt,.dxf';
        }

        return extension;
    },

    /**
         * 得到生日"yyyy-mm-dd"
         *
         * @param {Object} idCard 正确的 15/18 位身份证号码
         */
    getBirthday(idCard) {

        if (!idCard) {
            return '';
        }

        let birthday;

        if (idCard.length === 15) {

            birthday = idCard.charAt(6) + idCard.charAt(7);

            if (parseInt(birthday) < 10) {
                birthday = '20' + idCard.substr(6, 6);
            } else {
                birthday = '19' + idCard.substr(6, 6);
            }

        } else if (idCard.length === 18) {
            birthday = idCard.substr(6, 8);
        } else {
            birthday = '';
        }

        birthday = birthday.replace(/(.{4})(.{2})/, "$1-$2-");

        return birthday;
    },


    /**
         * 通过身份证获取性别
         * @param idCard 身份证
         * @returns {number} 1：男性，0：女性
         */
    getSex(idCard) {

        let order = (idCard.length === 18) ? idCard.slice(-2, -1) : idCard.slice(-1);

        return (order % 2 === 0) ? 0 : 1;
    },
    /************ Date Tools Begin*****************************************/

    /**
         * http://www.voidcn.com/article/p-miqwtixf-bqk.html
         *
         * 获取一天的毫秒数
         * @returns {number} 毫秒数
         */
    getMilliseconds() {
        return 1000 * 60 * 60 * 24;
    },

    /**
         * 获取当前时间
         *
         * @param date string 指定日期
         * @returns {Date}
         */
    getCurrentDate(date) {

        if (!date || typeof date === "undefined") {
            return new Date();
        }

        if (typeof date === "string") {
            return new Date(date.replace(/-/g, '/'));
        }

        return date;
    },


    /**
         * 获取当前时间范围，从00:00 ~ 59:59
         *
         * @param date string 指定日期
         * @returns {string}
         */
    getCurrentDay(date) {

        // 起止日期数组
        let startStop = [];

        // 获取当前时间
        let currentDate = this.getCurrentDate(date);

        // 添加本周起始时间
        startStop.push(currentDate);

        // 添加本周终止时间
        startStop.push(currentDate);

        return startStop;
    },


    /**
         * 获得本周【指定日期】起止时间，默认是当前日期
         *
         * @param date date指定日期
         * @returns {Array} [本周起始日期，本周结束日期]
         */
    getCurrentWeek(date) {

        // 起止日期数组
        let startStop = [];

        // 获取当前时间
        let currentDate = this.getCurrentDate(date);

        // 返回date是一周中的某一天
        let week = currentDate.getDay();

        // 一天的毫秒数
        let millisecond = this.getMilliseconds();

        // 减去的天数
        let minusDay = week !== 0 ? week - 1 : 6;

        // 本周 周一
        let monday = new Date(currentDate.getTime() - (minusDay * millisecond));

        // 本周 周日
        let sunday = new Date(monday.getTime() + (6 * millisecond));

        // 添加本周起始时间
        startStop.push(monday);

        // 添加本周终止时间
        startStop.push(sunday);

        return startStop;
    },

    /**
         * 获得本月【指定日期】起止时间，默认是当前日期
         *
         * @param date date指定日期
         * @returns {Array} [本月起始日期，本月结束日期]
         */
    getCurrentMonth(date) {

        // 起止日期数组
        let startStop = [];

        // 获取当前时间
        let currentDate = this.getCurrentDate(date);

        // 获得当前月份0-11
        let currentMonth = currentDate.getMonth();

        // 获得当前年份4位年
        let currentYear = currentDate.getFullYear();

        // 求出本月第一天
        let firstDay = new Date(currentYear, currentMonth, 1);


        // 当为12月的时候年份需要加1
        // 月份需要更新为0 也就是下一年的第一个月
        if (currentMonth === 11) {
            currentYear++;
            currentMonth = 0;
        } else {
            // 否则只是月份增加,以便求得下一月的第一天
            currentMonth++;
        }

        // 一天的毫秒数
        let millisecond = this.getMilliseconds();

        // 下月的第一天
        let nextMonthDayOne = new Date(currentYear, currentMonth, 1);

        // 求出上月的最后一天
        let lastDay = new Date(nextMonthDayOne.getTime() - millisecond);

        // 添加至数组中返回
        startStop.push(firstDay);
        startStop.push(lastDay);

        return startStop;
    },


    /**
         * 获得本季度的起止日期 date指定日期
         *
         * @param date date指定日期
         * @returns {Array} [本季度起始日期，本季度结束日期]
         */
    getCurrentSeason(date) {
        // 起止日期数组
        let startStop = [];

        // 获取当前时间
        let currentDate = this.getCurrentDate(date);

        // 获得当前月份0-11
        let currentMonth = currentDate.getMonth();

        // 获得当前年份4位年
        let currentYear = currentDate.getFullYear();

        // 获得本季度开始月份
        let quarterSeasonStartMonth = this.getQuarterSeasonStartMonth(currentMonth);

        // 获得本季度结束月份
        let quarterSeasonEndMonth = quarterSeasonStartMonth + 2;

        // 获得本季度开始的日期
        let quarterSeasonStartDate = new Date(currentYear, quarterSeasonStartMonth, 1);

        // 获得本季度结束的日期
        let quarterSeasonEndDate = new Date(currentYear, quarterSeasonEndMonth, this.getMonthDays(currentYear, quarterSeasonEndMonth));

        // 加入数组返回
        startStop.push(quarterSeasonStartDate);
        startStop.push(quarterSeasonEndDate);

        return startStop;
    },

    /**
         * 得到本年的起止日期
         *
         * @param date date指定日期
         * @returns {Array} [本年起始日期，本年结束日期]
         */
    getCurrentYear(date) {

        // 起止日期数组
        let startStop = [];

        // 获取当前时间
        let currentDate = this.getCurrentDate(date);

        // 获得当前年份4位年
        let currentYear = currentDate.getFullYear();

        // 本年第一天
        let currentYearFirstDate = new Date(currentYear, 0, 1);

        // 本年最后一天
        let currentYearLastDate = new Date(currentYear, 11, 31);

        // 添加至数组
        startStop.push(currentYearFirstDate);
        startStop.push(currentYearLastDate);

        return startStop;
    },


    /**
         * 得到本季度开始的月份
         *
         * @param month 需要计算的月份
         * @returns {number}
         */
    getQuarterSeasonStartMonth(month) {

        // 春
        let spring = 0;

        // 夏
        let summer = 3;

        // 秋
        let fall = 6;

        // 冬
        let winter = 9;

        // 月份从0-11
        if (month < 3) {
            return spring;
        }

        if (month < 6) {
            return summer;
        }

        if (month < 9) {
            return fall;
        }

        return winter;
    },


    /**
         * 获得该月的天数
         *
         * @param year 年份
         * @param month 月份
         * @returns {number}
         */
    getMonthDays(year, month) {
        // 本月第一天 1-31
        let relativeDate = new Date(year, month, 1);

        // 获得当前月份0-11
        let relativeMonth = relativeDate.getMonth();

        // 获得当前年份4位年
        let relativeYear = relativeDate.getFullYear();


        // 当为12月的时候年份需要加1
        // 月份需要更新为0 也就是下一年的第一个月
        if (relativeMonth === 11) {
            relativeYear++;
            relativeMonth = 0;
        } else {
            // 否则只是月份增加,以便求的下一月的第一天
            relativeMonth++;
        }
        // 一天的毫秒数
        let millisecond = this.getMilliseconds();

        // 下月的第一天
        let nextMonthDayOne = new Date(relativeYear, relativeMonth, 1);

        // 返回得到上月的最后一天,也就是本月总天数
        return new Date(nextMonthDayOne.getTime() - millisecond).getDate();
    },


    /**
         * 根据季度得到开始的月份
         *
         * @param season 需要计算的季度
         * @returns {string}
         */
    getStartMonthQuarterSeason(season) {

        if (season == 1) {
            return '01';
        }

        if (season == 2) {
            return '04';
        }

        if (season == 3) {
            return '07';
        }

        if (season == 4) {
            return '10';
        }

        return 0;
    }

    /************ Date Tools End*****************************************/
}
;

export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype.$bui, 'fn', {
            value: Functions
        });
    }
};
