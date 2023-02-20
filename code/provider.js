async function scheduleHtmlProvider(
    iframeContent = "",
    frameContent = "",
    dom = document
  ) {
    // 使用它们的时候务必带上await，否则没有系统alert的时停效果
    let iframe = dom.getElementsByTagName("iframe")[0].contentDocument;
    let table = iframe.getElementsByClassName("xfyq_area mt10")[0].outerHTML;
    // console.info(table)
    return table;
  }
  