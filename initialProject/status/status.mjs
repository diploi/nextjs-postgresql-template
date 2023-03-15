import http from 'http';
import { shellExec } from './shellExec.mjs';

const Status = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
};

const supervisorStatusToStatus = {
  STOPPED: Status.GREY,
  STARTING: Status.YELLOW,
  RUNNING: Status.GREEN,
  BACKOFF: Status.RED,
  STOPPING: Status.YELLOW,
  EXITED: Status.RED,
  FATAL: Status.RED,
  UNKNOWN: Status.RED,
};

const processStatusToMessage = (name, status) => {
  if (status === Status.GREEN) return `${name} process is running`;
  if (status === Status.YELLOW) return `${name} process is having issues`;
  if (status === Status.RED) return `${name} process has failed to start`;
  return `${name} process is stopped`;
};

const getSupervisorStatus = async (name, process) => {
  let status = Status.RED;
  let isPending = true;

  const processStatus = (await shellExec(`supervisorctl status ${process}`)).stdout || '';
  if (!processStatus.includes('ERROR')) {
    const supervisorStatus = processStatus.split(' ').filter((item) => !!item.trim())[1];
    status = supervisorStatusToStatus[supervisorStatus] || Status.RED;
    isPending = status === Status.RED;
  }

  return {
    status,
    isPending,
    message: processStatusToMessage(name, status),
  };
};

const getWWWStatus = async () => {
  try {
    const nextjsResponse = (await shellExec('curl http://localhost')).stdout;
    if (nextjsResponse && nextjsResponse.includes('__NEXT_DATA__')) {
      return {
        status: Status.GREEN,
        message: '',
      };
    }

    return {
      status: Status.RED,
      message: 'Next.js is not responding',
    };
  } catch {
    return {
      status: Status.RED,
      message: 'Failed to query Next.js status',
    };
  }
};

const getPostgresStatus = async () => {
  const commonStatus = {
    identifier: 'postgres',
    name: 'PostgreSQL',
    description: 'PostgreSQL database',
  };

  try {
    const postgresResponse = (await shellExec('pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT')).stdout;
    if (postgresResponse && postgresResponse.includes('accepting connections')) {
      return {
        ...commonStatus,
        status: Status.GREEN,
        message: '',
      };
    }

    return {
      ...commonStatus,
      status: Status.RED,
      message: 'PostgreSQL is not responding',
    };
  } catch {
    return {
      ...commonStatus,
      status: Status.RED,
      message: 'PostgreSQL is not responding',
    };
  }
};

const getStatus = async () => {
  const wwwProcessStatus = await getSupervisorStatus('Next.js', 'www');

  let wwwStatus = {
    identifier: 'www',
    name: 'Next.js',
    description: 'Next.js website',
    ...wwwProcessStatus,
  };

  if (wwwProcessStatus.status === Status.GREEN) {
    wwwStatus = { ...wwwStatus, ...(await getWWWStatus()) };
  }

  const status = {
    diploiStatusVersion: 1,
    items: [wwwStatus, await getPostgresStatus()],
  };

  return status;
};

const requestListener = async (req, res) => {
  res.writeHead(200);
  res.end(JSON.stringify(await getStatus()));
};

const server = http.createServer(requestListener);
server.listen(3000, '0.0.0.0');

const podReadinessLoop = async () => {
  const status = await getStatus();
  let allOK = !status.items.find((s) => s.status !== Status.GREEN);
  if (allOK) {
    await shellExec('touch /tmp/pod-ready');
  } else {
    await shellExec('rm -f /tmp/pod-ready');
  }
  setTimeout(() => {
    podReadinessLoop();
  }, 5000 + (allOK ? 1 : 0) * 5000);
};
podReadinessLoop();
