
// 导入创建切片的函数
import { createSlice } from "@reduxjs/toolkit";
// 定义初始化状态
const initialState = { value: "" };
// 创建切片
const PageSlice = createSlice({
  // 切片名称
  name: "PageDis",
  // 初始化状态
  initialState,
  // 定义处理器
  reducers: {
    // 改变页面状态
    ChangePage: (state, action) => {
      state.value = action.payload;
    }
  }
});

// 导出动作
export const { ChangePage } = PageSlice.actions;
// 导出处理器
export default PageSlice.reducer;

import { Dispatch } from "redux";
// 导出异步操作动作
export const syncChangePage = (value: string) => (dispatch: Dispatch) => {
  setTimeout(() => {
    dispatch(ChangePage(value));
  }, 2000);
};

