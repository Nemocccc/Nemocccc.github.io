
// 导入创建切片的函数
import { createSlice } from "@reduxjs/toolkit";
// 定义初始化状态
const initialState = { value: "" };
// 创建切片
const MDSlice = createSlice({
  // 切片名称
  name: "MDDis",
  // 初始化状态
  initialState,
  // 定义处理器
  reducers: {
    // 改变页面状态
    ChangeFile: (state, action) => {
      state.value = action.payload;
    }
  }
});

// 导出动作
export const { ChangeFile } = MDSlice.actions;
// 导出处理器
export default MDSlice.reducer;

import { Dispatch } from "redux";
// 导出异步操作动作
export const syncChangePage = (value: string) => (dispatch: Dispatch) => {
  setTimeout(() => {
    dispatch(ChangeFile(value));
  }, 2000);
};

