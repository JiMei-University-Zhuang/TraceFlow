import UserRawData from '../data/user_data.json';

type Visit = {
  routeInfo: string;
  httpRequest: string;
  visitTime: string;
  timestamp: string;
};

type UserData = {
  userID: string;
  userName: string;
  visitCount: number;
  visitTime: string;
  firstVisit: string;
  lastVisit: string;
};

// 生成最终的 UserData
const UserData = UserRawData.map((user: any) => {
  // 获取所有访问时间戳
  const timestamps = user.visits.map((visit: Visit) => visit.timestamp);

  // 计算最早和最晚的访问时间
  const firstVisit = timestamps.reduce((a, b) => (a < b ? a : b));
  const lastVisit = timestamps.reduce((a, b) => (a > b ? a : b));

  return {
    userID: user.userID,
    userName: user.userName,
    visitCount: user.visitCount,
    visitTime: user.totalVisitTime,
    firstVisit: firstVisit,
    lastVisit: lastVisit,
  };
});

export { UserData };
