//用户行为记录栈

import { behaviorStack } from '../types';

//限制存储数量
export interface behaviorRecordsOptions {
  maxBehaviorRecords: number;
}

//暂存用户的行为记录追踪
export default class behaviorStore {
  private state: Array<behaviorStack>;
  private maxBehaviorRecords: number;

  constructor(options: behaviorRecordsOptions) {
    const { maxBehaviorRecords } = options;
    this.maxBehaviorRecords = maxBehaviorRecords;
    this.state = [];
  }

  push(value: any) {
    if (this.length() === this.maxBehaviorRecords) {
      this.shift();
    }
    this.state.push(value);
  }

  shift() {
    return this.state.shift();
  }

  length() {
    return this.state.length;
  }
  get() {
    return this.state;
  }
  clear() {
    this.state = [];
  }
}
