function scheduleHtmlParser(html) {
  /** 课程信息 */
  let courseInfos = [];
  const lines = $(".addlist_01").find("tr"); // 表的所有行
  for (let l = 1; l <= 6; l++) {
    // 1-6行为课程
    const linelessons = $(lines[l]).find("td");
    for (let day = 1; day <= 7; day++) {
      // 1-7列为每一天
      const index = day + 1; // 列标为天数+1
      const text = getText(linelessons[index]);
      if (text[0] === "&nbsp;") {
        continue;
      }
      let lessons;
      if (text.length === 1) {
      } else if (text.length === 2) {
        if (text[1].indexOf("，[") === -1) {
          lessons = [getLesson(text[0], day, text[1])];
        } else {
          lessons = getLessons2(text[0], day, text[1]);
        }
      } else if (text.length === 3) {
        lessons = getLessons3(text[0], day, text[1], text[2]);
      } else {
        lessons = getLessons(text, day);
      }
      for (let l in lessons) {
        courseInfos.push(lessons[l]);
      }
    }
  }
  return courseInfos;
}

/**
 * 获取cheerio解析的元素文本
 * @param element cheerio解析的元素
 * @returns {Array<string>} 元素文本列表
 */
function getText(element) {
  let ele = element;
  const text = [];
  while (ele) {
    if (ele.children) {
      ele = ele.children[0];
    } else if (ele.data) {
      text.push(ele.data);
      ele = ele.next;
    }
  }
  return text;
}

/**
 * 提取课程周数
 * @param {string} str 包含周数的字符串，如`[1-9，11]`、`12，14`、`[2，4，12，14双]`、`[14]`
 * @returns {Array<number>} 包含`str`中所有周数的数组
 */
function getWeeks(str) {
  let weeks = [];
  str = str.split("[")[1].split("]")[0];
  let weekArray = str.split("，");
  for (let i in weekArray) {
    const begin = weekArray[i].split("-")[0];
    let end = weekArray[i].split("-")[1];
    if (!end) {
      end = begin;
    }
    for (let j = parseInt(begin); j <= parseInt(end); j++) {
      if (weekArray[i].indexOf("双") !== -1) {
        if (j % 2 === 0) {
          weeks.push(j);
        }
      } else if (weekArray[i].indexOf("单") !== -1) {
        if (j % 2 === 1) {
          weeks.push(j);
        }
      } else {
        weeks.push(j);
      }
    }
  }
  return weeks;
}

/**
 * 提取课程节数
 * @param {string} str 包含节数的字符串，如`第8，9节`
 * @returns {Array<number>} 包含`str`中所有节数的数组
 */
function getSections(str) {
  let sections = [];
  str = /第(.+?)节/g.exec(str)[0].replace("第", "").replace("节", "");
  let sectionArray = str.split("，");
  for (let i in sectionArray) {
    sections.push(parseInt(sectionArray[i].replace(/[^0-9]/gi, "")));
  }
  return sections;
}

/**
 * 获取单节课程信息
 *
 * 0: "电子工程技术训练"
 *
 * 1: "王虹霞[1-9]周沙河工训\n第1，2节"
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info 课程信息字符串
 * @returns {object} 课程信息
 */
function getLesson(lessonName, day, info) {
  let lesson = { sections: getSections(info), weeks: getWeeks(info) };
  lesson.name = lessonName;
  lesson.day = day;
  lesson.teacher = info.split("[")[0].replace(/\s+/g, ""); //去掉空格，多教师只提取第一个
  //提取教室
  tmp = info.split("周");
  lesson.position = tmp[tmp.length - 1].split("\n")[0];

  return lesson;
}

/**
 * 获取 3 行课程信息（同一课程被拆分为多节课）
 *
 * 0: "围棋基础（1）(待生效)"
 *
 * 1: "薛  峰[11]周，[3-10]周"
 *
 * 2: "J3-411\n第11，12节"
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info1 课程信息（不含教室，第一行）
 * @param {string} info2 教室（第二行）
 * @returns {Array<object>} 课程信息
 */
function getLessons3(lessonName, day, info1, info2) {
  let lessons = [];
  let position = info2.split("\n")[0];
  let sections = getSections(info2);
  let allWeeks = info1.split("周，");
  const teacher = allWeeks[0].split("[")[0].replace(/\s+/g, ""); //去掉空格
  for (i in allWeeks) {
    let lesson = { sections: sections, weeks: getWeeks(allWeeks[i]) };
    lesson.name = lessonName;
    lesson.day = day;
    lesson.teacher = allWeeks[i].split("[")[0].replace(/\s+/g, ""); //去掉空格
    if (!lesson.teacher) {
      // 如果没有解析到教师，则使用第一个教师
      lesson.teacher = teacher;
    }
    lesson.position = position;
    lessons.push(lesson);
  }
  return lessons;
}

/**
 * 获取多节课程信息（同一老师不同教室， 如`张老师[10-13]周机房 第1，2节，[2-9]周（五）111 第1，2节`）
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info 课程信息字符串
 * @returns {Array<object>} 课程信息
 */
function getLessons2(lessonName, day, info) {
  let lessons = [];
  let teacher = info.split("[")[0].replace(/\s+/g, ""); //去掉空格
  let weekArray = info.split("\n");
  let n = weekArray.length;
  for (let i = 0; i < n - 1; i++) {
    let lesson = {
      sections: getSections(weekArray[i + 1]),
      weeks: getWeeks(weekArray[i]),
    };
    lesson.name = lessonName;
    lesson.day = day;
    lesson.teacher = teacher;
    lesson.position = weekArray[i].split("周")[1];
    lessons.push(lesson);
  }
  return lessons;
}

/**
 * 获取多节课程信息（同一课程被拆分为不同老师不同教室）
 *
 * 0: "基础物理实验(1)"
 *
 * 1: "陈  彦[3-17]周"
 *
 * 2: "物理教学与实验中心\n第6，7节，唐  芳[3-17]周"
 *
 * 3: "物理教学与实验中心\n第6，7节，王文玲[2]周"
 *
 * 4: "(一)30\n第6，7节，王文玲[3-17]周"
 *
 * 5: "物理教学与实验中心\n第6，7节，熊  畅[3-17]周"
 *
 * 6: "物理教学与实验中心\n第6，7节，徐  平[3-17]周"
 *
 * 7: "物理教学与实验中心\n第6，7节，严琪琪[3-17]周"
 *
 * 8: "物理教学与实验中心\n第6，7节，赵  路[3-17]周"
 *
 * 9: "物理教学与实验中心\n第6，7节"
 *
 * ---
 *
 * 0: "走进软件"
 *
 * 1: "葛 宁[2，3，5，8，10，14]周"
 *
 * 2: "J3-312\n第11，12节，李祺[2，4，12，14双]周"
 *
 * 3: "J3-312\n第11，12节，于 茜[2，7-12单，13，14]周"
 *
 * 4: "机房\n第11，12节，张 莉[2，14双]周"
 *
 * 5: "J3-312\n第11，12节"
 *
 * @param {string} text 课程信息
 * @param {number} day 星期
 * @returns {Array<object>} 课程信息
 */
function getLessonsN(text, day) {
  let lessons = [];
  const lessonName = text[0];
  for (let i = 1; i < text.length - 1; i++) {
    lessons.push({
      name: lessonName,
      day: day,
      teacher: /[^\[0-9]+(?=[\[0-9])/.exec(text[i])[0].replace(/\s*/g, ""),
      position: text[i + 1].split("\n")[0],
      sections: getSections(text[i + 1].split("\n")[1].split("节")[0] + "节"),
      weeks: getWeeks(/[\[0-9-，单双\]]+(?=周)/.exec(text[i])[0]),
    });
  }
  return lessons;
}

/**
 * 获取超过 3 行课程信息
 *
 * 0: "数据结构(实验)"
 *
 * 1: "刘  博[16，17]周学院教学实验室-航天工程综合实验与创新中心（主楼D306）\n第3，4节"
 *
 * 2: "数据结构"
 *
 * 3: "刘  博[10-15]周，谢凤英[1-9]周"
 *
 * 4: "J4-206\n第3，4节"
 *
 * @param {Array<string>} text 原始文本
 * @param {number} day 星期
 * @returns {Array<object>} 课程信息
 */
function getLessons(text, day) {
  let lessons = [];
  let infos = [];
  let info = [];
  let isPrevLineSecOrWeek = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i].indexOf("节") > -1 || text[i].indexOf("周") > -1) {
      isPrevLineSecOrWeek = true;
    } else {
      if (isPrevLineSecOrWeek) {
        infos.push(info);
        info = [];
        isPrevLineSecOrWeek = false;
      }
    }
    info.push(text[i]);
    if (i === text.length - 1) {
      infos.push(info);
    }
  }
  for (const i of infos) {
    if (i.length === 2) {
      lessons.push(getLesson(i[0], day, i[1]));
    } else if (i.length === 3) {
      const l = getLessons3(i[0], day, i[1], i[2]);
      for (const j of l) {
        lessons.push(j);
      }
    } else {
      const l = getLessonsN(text, day);
      for (const j of l) {
        lessons.push(j);
      }
    }
  }
  return lessons;
}

function logText(text) {
  for (let i in text) {
    console.log(i + ": " + text[i]);
  }
  console.log("-----------------------");
}
