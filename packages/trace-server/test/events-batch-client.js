/**
 * 客户端测试脚本，模拟SDK向服务器发送批量事件数据
 * 使用方法:
 * 1. 确保trace-server已经启动，默认监听3000端口
 * 2. 执行 node events-batch-client.js
 */

// 模拟SDK发送的批量事件数据
const batchEvents = [
  // 性能事件1
  {
    eventType: 'performance',
    timestamp: Date.now(),
    pageUrl: 'http://localhost:3000/test',
    eventData: {
      LCP: 2500,
      FCP: 1200,
      CLS: 0.1,
      TTFB: 800,
    },
  },
  // 行为事件
  {
    eventType: 'behavior_click',
    timestamp: Date.now(),
    pageUrl: 'http://localhost:3000/test',
    eventData: {
      element: 'button',
      content: 'Submit',
    },
  },
  // 性能事件2
  {
    eventType: 'performance',
    timestamp: Date.now(),
    pageUrl: 'http://localhost:3000/other-page',
    eventData: {
      LCP: 3000,
      FP: 900,
    },
  },
  // 错误事件
  {
    eventType: 'error',
    timestamp: Date.now(),
    pageUrl: 'http://localhost:3000/error-page',
    eventData: {
      message: 'Test error message',
      stack: 'Error: Test error\n    at test.js:10:15',
    },
  },
];

// 发送批量数据
async function sendBatchEvents() {
  try {
    console.log('发送批量事件数据...');

    const response = await fetch('http://localhost:3000/events/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchEvents),
    });

    const result = await response.json();

    console.log('服务器响应:');
    console.log(JSON.stringify(result, null, 2));

    // 显示处理统计信息
    if (result.data && result.data.byType) {
      console.log('\n事件处理统计:');
      Object.entries(result.data.byType).forEach(([type, count]) => {
        console.log(
          `- ${type}: ${count}/${
            batchEvents.filter((e) => e.eventType === type).length
          } 条事件已处理`,
        );
      });
    }

    // 检查是否有未处理的事件类型
    const processedTypes = Object.keys(result.data.byType || {});
    const allTypes = [...new Set(batchEvents.map((e) => e.eventType))];
    const unprocessedTypes = allTypes.filter(
      (type) => !processedTypes.includes(type),
    );

    if (unprocessedTypes.length > 0) {
      console.log('\n未处理的事件类型:');
      unprocessedTypes.forEach((type) => {
        console.log(
          `- ${type}: 需要在EventsController中实现processEvent处理逻辑`,
        );
      });
    }
  } catch (error) {
    console.error('发送批量事件数据失败:', error);
  }
}

sendBatchEvents();
