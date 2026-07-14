import { logger } from '@/lib/logger';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_ALERTS_ENABLED = Boolean(SLACK_WEBHOOK_URL);

/**
 * Slack message color codes
 */
enum SlackColor {
  SUCCESS = '#36a64f',
  WARNING = '#ff9900',
  ERROR = '#ff0000',
  INFO = '#0099ff',
}

/**
 * Slack message attachment structure
 */
interface SlackAttachment {
  color: SlackColor;
  title: string;
  text: string;
  fields?: Array<{
    title: string;
    value: string;
    short: boolean;
  }>;
  ts: number;
}

/**
 * Send a Slack notification
 */
async function sendSlackMessage(
  text: string,
  attachment: SlackAttachment
): Promise<boolean> {
  if (!SLACK_ALERTS_ENABLED) {
    logger.warn('Slack alerts not configured (SLACK_WEBHOOK_URL missing)');
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        attachments: [attachment],
      }),
    });

    if (!response.ok) {
      logger.error('Slack notification failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Slack notification error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Notify security event (potential attack)
 */
export async function notifySecurityEvent(
  eventType: string,
  ip: string,
  endpoint: string,
  details: {
    count?: number;
    threshold?: number;
    action?: string;
  }
): Promise<void> {
  const attachment: SlackAttachment = {
    color: SlackColor.ERROR,
    title: `🚨 Security Event: ${eventType}`,
    text: `Potential security issue detected`,
    fields: [
      { title: 'Event Type', value: eventType, short: true },
      { title: 'Client IP', value: ip, short: true },
      { title: 'Endpoint', value: endpoint, short: true },
      { title: 'Timestamp', value: new Date().toISOString(), short: true },
    ],
    ts: Math.floor(Date.now() / 1000),
  };

  if (details.count !== undefined) {
    attachment.fields!.push({
      title: 'Attempt Count',
      value: String(details.count),
      short: true,
    });
  }

  if (details.threshold !== undefined) {
    attachment.fields!.push({
      title: 'Threshold',
      value: String(details.threshold),
      short: true,
    });
  }

  if (details.action) {
    attachment.fields!.push({
      title: 'Action Taken',
      value: details.action,
      short: false,
    });
  }

  await sendSlackMessage(
    `⚠️ Security Alert: ${eventType} from ${ip}`,
    attachment
  );
}

/**
 * Notify service degradation
 */
export async function notifyServiceDegradation(
  serviceName: string,
  status: string,
  latencyMs: number
): Promise<void> {
  const attachment: SlackAttachment = {
    color: SlackColor.WARNING,
    title: `⚠️ Service Degradation: ${serviceName}`,
    text: `Service health check detected issues`,
    fields: [
      { title: 'Service', value: serviceName, short: true },
      { title: 'Status', value: status, short: true },
      { title: 'Latency (ms)', value: String(latencyMs), short: true },
      { title: 'Timestamp', value: new Date().toISOString(), short: true },
    ],
    ts: Math.floor(Date.now() / 1000),
  };

  await sendSlackMessage(
    `⚠️ Service Alert: ${serviceName} is ${status}`,
    attachment
  );
}

/**
 * Notify successful deployment
 */
export async function notifyDeploymentSuccess(
  environment: string,
  commitSha: string,
  commitMessage: string
): Promise<void> {
  const attachment: SlackAttachment = {
    color: SlackColor.SUCCESS,
    title: `✅ Deployment Successful: ${environment}`,
    text: `New version deployed`,
    fields: [
      { title: 'Environment', value: environment, short: true },
      { title: 'Commit', value: commitSha.substring(0, 8), short: true },
      { title: 'Message', value: commitMessage, short: false },
      { title: 'Timestamp', value: new Date().toISOString(), short: true },
    ],
    ts: Math.floor(Date.now() / 1000),
  };

  await sendSlackMessage(
    `✅ ${environment} deployed successfully`,
    attachment
  );
}

/**
 * Notify deployment failure
 */
export async function notifyDeploymentFailure(
  environment: string,
  error: string
): Promise<void> {
  const attachment: SlackAttachment = {
    color: SlackColor.ERROR,
    title: `❌ Deployment Failed: ${environment}`,
    text: `Deployment encountered an error`,
    fields: [
      { title: 'Environment', value: environment, short: true },
      { title: 'Error', value: error, short: false },
      { title: 'Timestamp', value: new Date().toISOString(), short: true },
    ],
    ts: Math.floor(Date.now() / 1000),
  };

  await sendSlackMessage(
    `❌ ${environment} deployment failed`,
    attachment
  );
}
