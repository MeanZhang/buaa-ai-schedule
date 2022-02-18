async function scheduleHtmlProvider(
  iframeContent = "",
  frameContent = "",
  dom = document
) {
  await loadTool("AIScheduleTools");
  // 使用它们的时候务必带上await，否则没有系统alert的时停效果
  await AIScheduleAlert("开始导入……\n完成后请手动修改开学时间\n如导入出错或有其他建议请联系QQ：390602272");
  let iframe = dom.getElementsByTagName("iframe")[0].contentDocument;
  let table = iframe.getElementsByClassName("xfyq_area mt10")[0].outerHTML;
  // console.info(table)
  return table;
}
