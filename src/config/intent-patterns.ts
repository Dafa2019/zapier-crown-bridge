import type { IntentPattern } from '../types/index.js';

export const intentPatterns: IntentPattern[] = [
  {
    intent: 'approve_pr',
    patterns: [
      /(?:批准|approve|通过|同意)\s*(?:PR|pr|Pull Request|拉取请求)\s*#?\s*(\d+)/i,
      /(?:PR|pr)\s*#?\s*(\d+)\s*(?:批准|approve|通过|同意)/i,
    ],
    routeType: 'pr_direct',
  },
  {
    intent: 'reject_pr',
    patterns: [
      /(?:拒绝|reject|驳回|打回)\s*(?:PR|pr)\s*#?\s*(\d+)/i,
      /(?:PR|pr)\s*#?\s*(\d+)\s*(?:拒绝|reject|驳回)/i,
    ],
    routeType: 'pr_direct',
  },
  {
    intent: 'merge_pr',
    patterns: [
      /(?:合并|merge)\s*(?:PR|pr)\s*#?\s*(\d+)/i,
      /(?:PR|pr)\s*#?\s*(\d+)\s*(?:合并|merge)/i,
    ],
    routeType: 'pr_direct',
  },
  {
    intent: 'defer_pr',
    patterns: [
      /(?:延迟|defer|推迟|暂缓)\s*(?:PR|pr)\s*#?\s*(\d+)/i,
      /(?:PR|pr)\s*#?\s*(\d+)\s*(?:延迟|defer|推迟|暂缓)/i,
    ],
    routeType: 'pr_direct',
  },
  {
    intent: 'check_status',
    patterns: [
      /(?:检查|check|查看|查询)\s*(?:状态|status|更新|update)/i,
      /(?:状态|status)\s*(?:检查|check|查看|查询)/i,
    ],
    routeType: 'internal',
  },
  {
    intent: 'execute_writeback',
    patterns: [
      /(?:执行|execute|触发|trigger)?\s*(?:写回|writeback|回写)/i,
    ],
    routeType: 'zapier',
  },
  {
    intent: 'trigger_digest',
    patterns: [
      /(?:触发|trigger|生成|generate)?\s*(?:摘要|digest|汇总|summary)/i,
    ],
    routeType: 'zapier',
  },
  {
    intent: 'delegate_task',
    patterns: [
      /(?:任务|task|委派|delegate)[：:]\s*(.+)/i,
      /(?:分配|assign)\s*(?:任务|task)\s*(?:给|to)\s*/i,
    ],
    routeType: 'zapier',
  },
  {
    intent: 'quick_task',
    patterns: [
      /(?:快速|quick)\s*(?:任务|task)[：:]\s*(.+)/i,
    ],
    routeType: 'zapier',
  },
];
