import UserRawData from '../data/userdata.json';

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

type VisitData = {
  userID: string;
  userName: string;
  routeInfo: string;
  httpRequest: string;
  visitTime: string;
  timestamp: string;
};

// 生成最终的 UserData
const UserData: UserData[] = UserRawData.map((user: any) => {
  // 获取所有访问时间戳
  const timestamps = user.visits.map((visit: Visit) => visit.timestamp);

  // 计算最早和最晚的访问时间
  const firstVisit = timestamps.reduce((a, b) => (a < b ? a : b));
  const lastVisit = timestamps.reduce((a, b) => (a > b ? a : b));

  return {
    userID: user.userID,
    userName: user.userName,
    visitCount: user.visits.length,
    visitTime: user.totalVisitTime,
    firstVisit: firstVisit,
    lastVisit: lastVisit,
  };
});

// 生成最终的 VisitData
const VisitData: VisitData[] = UserRawData.flatMap((user: any) =>
  user.visits.map((visit: Visit) => ({
    userID: user.userID,
    userName: user.userName,
    routeInfo: visit.routeInfo,
    httpRequest: visit.httpRequest,
    visitTime: visit.visitTime,
    timestamp: visit.timestamp,
  })),
);

export { UserData, VisitData };
