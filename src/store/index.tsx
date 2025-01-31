// 定义仓库
// 引入configureStore 定义仓库
import { configureStore } from "@reduxjs/toolkit";
// 导入Slice
import PageDis from "./states/PageState";
import MDDis from "./states/MDState";
// 导出
export const store = configureStore({
  // 数据处理
  reducer: {
    PageDis,
    MDDis
  }
});

