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
        lessons = getLessons1(text[0], day, text[1], text[2]);
      } else {
        console.log(text);
        console.log(linelessons[index]);
        lessons = getLessons3(text[0], day, text[1], text[2], text[3]);
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
 * @param {string} str 包含周数的字符串，如`[1-9，11]`、`12，14`
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
      weeks.push(j);
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
 * 获取多节课程信息（同一课程被拆分为多节课）
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info1 课程信息（不含教室，第一行）
 * @param {string} info2 教室（第二行）
 * @returns {Array<object>} 课程信息
 */
function getLessons1(lessonName, day, info1, info2) {
  let lessons = [];
  let position = info2.split("\n")[0];
  let sections = getSections(info2);
  let allWeeks = info1.split("周，");
  for (i in allWeeks) {
    let lesson = { sections: sections, weeks: getWeeks(allWeeks[i]) };
    lesson.name = lessonName;
    lesson.day = day;
    lesson.teacher = allWeeks[i].split("[")[0].replace(/\s+/g, ""); //去掉空格
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
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info1 课程信息1（“丁老师[1-8]周”）
 * @param {string} info2 课程信息2（“(三)302\n第3，4节，徐  坤[9-16]周”）
 * @param {string} info3 课程信息3（“(三)312\n第3，4节”）
 * @returns {Array<object>} 课程信息
 */
function getLessons3(lessonName, day, info1, info2, info3) {
  console.log(lessonName, day, info1, info2, info3);
  let lessons = [];
  lessons.push({
    name: lessonName,
    day: day,
    teacher: /[^\[0-9]+(?=[\[0-9])/.exec(info1)[0].replace(/\s*/g, ""),
    position: info2.split("\n")[0],
    sections: getSections(info2.split("\n")[1].split("节")[0] + "节"),
    weeks: getWeeks(/[\[0-9-\]]+(?=周)/.exec(info1)[0]),
  });
  lessons.push({
    name: lessonName,
    day: day,
    teacher: /[^\[0-9]+(?=[\[0-9])/
      .exec(info2.split("节，")[1])[0]
      .replace(/\s*/g, ""),
    position: info3.split("\n")[0],
    sections: getSections(info3.split("\n")[1].split("节")[0] + "节"),
    weeks: getWeeks(/[\[0-9-\]]+(?=周)/.exec(info2)[0]),
  });
  return lessons;
}
