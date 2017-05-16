import * as _ from 'lodash';
import * as sinon from 'sinon';
import * as assert from 'assert';

import { createContext } from '@matchmaker/context/create';
import { QueueService } from '@matchmaker/queue/queueService';
import { QueueDao } from '@matchmaker/queue/queueDao';
import { IQueueConfig, defaultConfig } from '@matchmaker/queue/queueConfig';

export async function testQueueCreate() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const queueDao = context.getInstance(QueueDao);
  const queueDaoCreateMock = sinon.stub(queueDao, 'create').callsFake((params) => {
    params.id = 'mockedId';
    return params;
  });

  const queue = await queueService.createQueue({ mocked: 'mocked' } as any);
  assert(queue!.id === 'mockedId', 'id mismatched');
  assert(queue['mocked'] === 'mocked', 'config mismatched');
  assert(queueDaoCreateMock.calledOnce, 'dao not called');

  assert(_.isEqual(queueDaoCreateMock.getCall(0).args[0], { mocked: 'mocked' }), 'call argument mismatched');
}

