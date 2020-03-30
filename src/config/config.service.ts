import * as dotenv from 'dotenv';
import { ConfigObject } from './config.object';

enum Environments {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class ConfigService {

  configObject: ConfigObject;
  environment: Environments;

  constructor() {
    const ENVIRONMENTS = process.env;
    if (ENVIRONMENTS.NODE_ENV !== 'production') {
      dotenv.config();
      this.environment = Environments.PRODUCTION;
      this.configObject = {
        jiraHost: ENVIRONMENTS.JIRA_HOST,
        jiraUser: ENVIRONMENTS.JIRA_USER,
        jiraPass: ENVIRONMENTS.JIRA_PASS,
        logTimeWebHook: ENVIRONMENTS.LOGTIME_INCOMING_WEBHOOK,
        verify: ENVIRONMENTS.VERIFY_TOKEN,
      };
    } else {
      this.environment = Environments.DEVELOPMENT;
      this.configObject = {
        jiraHost: ENVIRONMENTS.JIRA_HOST,
        jiraUser: ENVIRONMENTS.JIRA_USER,
        jiraPass: ENVIRONMENTS.JIRA_PASS,
        logTimeWebHook: ENVIRONMENTS.LOGTIME_INCOMING_WEBHOOK,
        verify: ENVIRONMENTS.VERIFY_TOKEN,
      };
    }

  }

  getConfig(): ConfigObject {
    return this.configObject;
  }

  getEnvironment(): string {
    return this.environment;
  }
}
