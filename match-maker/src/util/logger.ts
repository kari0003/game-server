import * as bunyan from 'bunyan';
import * as PrettyStream from 'bunyan-prettystream';

interface IBunyanStream {
  level: string;
  stream: NodeJS.WritableStream;
}

const streams: IBunyanStream[] = [];


const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);
streams.push({
  level: 'debug',
  stream: prettyStdOut,
});

const logger = bunyan.createLogger({
  name: 'matchmaker-logger',
  serializers: bunyan.stdSerializers,
  streams,
});

export { logger };
