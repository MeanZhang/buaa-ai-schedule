function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
    function getWeeks(s) {
        //提取周数
        let weeks = []
        s = s.split("[")[1].split("]")[0]
        let weekArray = s.split("，")
        for (let i in weekArray) {
            const begin = weekArray[i].split("-")[0]
            let end = weekArray[i].split("-")[1]
            if (!end) {
                end = begin
            }
            for (let j = parseInt(begin); j <= parseInt(end); j++) {
                weeks.push(j)
            }
        }
        return weeks
    }

    function getSections(s) {
        let sections = []
        s = /第(.+?)节/g.exec(s)[0].replace("第", "").replace("节", "")
        let sectionArray = s.split("，")
        for (let i in sectionArray) {
            sections.push({ section: parseInt(sectionArray[i].replace(/[^0-9]/ig, "")), startTime: "", endTime: "" })
        }
        return sections
    }

    function getLesson(lessonName, day, c) {
        let s = c.data
        let lesson = { sections: getSections(s), weeks: getWeeks(s) }
        lesson.name = lessonName
        lesson.day = day
        lesson.teacher = s.split("[")[0].replace(/\s+/g, "")//去掉空格

        //提取位置
        tmp = s.split("周")
        lesson.position = tmp[tmp.length - 1].split("\n")[0]

        return lesson
    }

    function getLessons1(lessonName, day, c1, c2) {
        let lessons = []
        let s1 = c1.data
        let s2 = c2.data
        let position = s2.split("\n")[0]
        let sections = getSections(s2)
        let allWeeks = s1.split("周，")
        for (i in allWeeks) {
            let lesson = { sections: sections, weeks: getWeeks(allWeeks[i]) }
            lesson.name = lessonName
            lesson.day = day
            lesson.teacher = allWeeks[i].split("[")[0].replace(/\s+/g, "")//去掉空格
            lesson.position = position
            lessons.push(lesson)
        }
        return lessons
    }

    function getLessons2(lessonName, day, c) {
        let lessons = []
        let s = c.data
        let teacher = s.split("[")[0].replace(/\s+/g, "")//去掉空格
        let weekArray = s.split("\n")
        let n = weekArray.length
        for (let i = 0; i < n - 1; i++) {
            let lesson = { sections: getSections(weekArray[i + 1]), weeks: getWeeks(weekArray[i]) }
            lesson.name = lessonName
            lesson.day = day
            lesson.teacher = teacher
            lesson.position = weekArray[i].split("周")[1]
            lessons.push(lesson)
        }
        return lessons
    }

    //主体
    let courseInfos = []
    const lines = $('.addlist_01').find('tr')// 表的所有行
    for (let l = 1; l <= 6; l++) {// 1-6行为课程
        const linelessons = $(lines[l]).find('td')
        for (let day = 1; day <= 7; day++) {// 1-7列为每一天
            const index = day + 1// 列标为天数+1
            let c = linelessons[index].children[0]
            if (c.data !== "&nbsp;") {//时间段不为空
                while (c) {//一个时间段可能有多个课程
                    lessonName = c.data.slice(0, 39)//课程名长度不能超过40字符
                    c = c.next.children[0]
                    if (c.data.slice(-1) === "节") {
                        if (c.data.indexOf("，[") === -1) {//同一地点不同老师
                            courseInfos.push(getLesson(lessonName, day, c))

                            //一个时间段可能有多个课程
                            c = c.next
                            if (c) {
                                c = c.children[0]
                            }
                        }
                        else {//同一老师不同教师
                            lessons = getLessons2(lessonName, day, c)
                            for (let i in lessons) {
                                courseInfos.push(lessons[i])
                            }

                            //一个时间段可能有多个课程
                            c = c.next
                            if (c) {
                                c = c.children[0]
                            }
                        }
                    }
                    else {//同一课程被拆分为多节课
                        lessons = getLessons1(lessonName, day, c, c.next.children[0])
                        for (let i in lessons) {
                            courseInfos.push(lessons[i])
                        }

                        //一个时间段可能有多个课程
                        c = c.next.children[0].next
                        if (c) {
                            c = c.children[0]
                        }
                    }
                }

            }
        }
    }
    //课程时间
    const sectionTimes = [
        {
            "section": 1,
            "startTime": "08:00",
            "endTime": "08:45"
        },
        {
            "section": 2,
            "startTime": "08:50",
            "endTime": "09:35"
        },
        {
            "section": 3,
            "startTime": "09:50",
            "endTime": "10:35"
        },
        {
            "section": 4,
            "startTime": "10:40",
            "endTime": "11:25"
        },
        {
            "section": 5,
            "startTime": "11:30",
            "endTime": "12:15"
        },
        {
            "section": 6,
            "startTime": "14:00",
            "endTime": "14:45"
        },
        {
            "section": 7,
            "startTime": "14:50",
            "endTime": "15:35"
        },
        {
            "section": 8,
            "startTime": "15:50",
            "endTime": "16:35"
        },
        {
            "section": 9,
            "startTime": "16:40",
            "endTime": "17:25"
        },
        {
            "section": 10,
            "startTime": "17:30",
            "endTime": "18:15"
        },
        {
            "section": 11,
            "startTime": "19:00",
            "endTime": "19:45"
        },
        {
            "section": 12,
            "startTime": "19:50",
            "endTime": "20:35"
        },
        {
            "section": 13,
            "startTime": "20:40",
            "endTime": "21:25"
        },
        {
            "section": 14,
            "startTime": "21:30",
            "endTime": "22:15"
        }
    ];

    console.info({ courseInfos: courseInfos, sectionTimes: sectionTimes });
    return { courseInfos: courseInfos, sectionTimes: sectionTimes };
}