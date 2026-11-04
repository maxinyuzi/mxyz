/*
  作者：马昕玉子
  建立时间：2026-11-04
  使用大模型：GLM-5.3-Flash
  功能名称：可复用的 tab 选项卡组件
*/

/* 功能：初始化一个选项卡组。
   为容器内每个选项卡按钮绑定点击监听事件；点击时先清除本组所有
   选项卡和面板的选中状态，再设置当前点击的元素为选中，并切换到
   与之对应的内容面板。 */
function mxyzInitTabs(mxyzGroup) {
    var mxyzTabList = mxyzGroup.querySelectorAll("[data-mxyz-tab]");
    var mxyzPaneList = mxyzGroup.querySelectorAll("[data-mxyz-pane]");

    /* 选项卡点击监听事件：完成「先清除所有选中，再设置当前选中」的切换逻辑 */
    mxyzTabList.forEach(function (mxyzTab) {
        mxyzTab.addEventListener("click", function () {
            // 第一步：清除本组所有选项卡与面板的选中状态
            mxyzTabList.forEach(function (mxyzT) {
                mxyzT.classList.remove("mxyz_active");
                mxyzT.setAttribute("aria-selected", "false");
            });
            mxyzPaneList.forEach(function (mxyzP) {
                mxyzP.classList.remove("mxyz_active");
            });

            // 第二步：设置当前点击的选项卡为选中状态
            mxyzTab.classList.add("mxyz_active");
            mxyzTab.setAttribute("aria-selected", "true");

            // 第三步：显示与当前选项卡同名的面板，实现内容切换
            var mxyzName = mxyzTab.getAttribute("data-mxyz-tab");
            mxyzPaneList.forEach(function (mxyzP) {
                if (mxyzP.getAttribute("data-mxyz-pane") === mxyzName) {
                    mxyzP.classList.add("mxyz_active");
                }
            });
        });
    });
}

/* 功能：页面加载后，把所有标记了 data-mxyz-tabs 的容器都初始化为选项卡组，
   一个页面放多少组都自动生效，体现组件的可复用性。 */
document.querySelectorAll("[data-mxyz-tabs]").forEach(mxyzInitTabs);
