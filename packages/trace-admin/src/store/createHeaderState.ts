import { create } from 'zustand';
import { RadioChangeEvent } from 'antd';

// 时间框数据变化的状态
interface HeaderState {
  timeState: string;
  // 时间变更的函数
  timeToday: () => void;
  timeYesterday: () => void;
  timeSeven: () => void;
  timeThirty: () => void;
  onchangeTime: (e: RadioChangeEvent) => void;
}

const createHeaderState = () => {
  return create<HeaderState>((set, get) => ({
    timeState: 'today',
    timeToday: () => set({ timeState: 'today' }),
    timeYesterday: () => set({ timeState: 'yesterday' }),
    timeSeven: () => set({ timeState: 'seven' }),
    timeThirty: () => set({ timeState: 'thirty' }),
    onchangeTime: (e: RadioChangeEvent) => {
      const { timeToday, timeYesterday, timeSeven, timeThirty } = get();
      switch (e.target.value) {
        case 'today':
          timeToday();
          break;
        case 'yesterday':
          timeYesterday();
          break;
        case 'seven':
          timeSeven();
          break;
        case 'thirty':
          timeThirty();
          break;
      }
    },
  }));
};
export default createHeaderState;
