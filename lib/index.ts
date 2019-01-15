import { RTMClient, WebClient } from '@slack/client';
import { parse, render } from './parser';
import { init, send } from './socket';

export async function main(options: any) {
  const wsConnecting = init(options.url);
  const rtm = new RTMClient(options.token);
  const web = new WebClient(options.token);

  const channelMap: Record<string, string> = {};
  const userMap: Record<string, string> = {};

  rtm.on('channel_created', ({ channel }) => {
    channelMap[channel.id] = channel.name;
  });

  rtm.on('channel_rename', ({ channel }) => {
    channelMap[channel.id] = channel.name;
  });

  rtm.on('channel_deleted', ({ channel }) => {
    delete channelMap[channel];
  });

  rtm.on('team_join', ({ user }) => {
    userMap[user.id] = user.name;
  });

  rtm.on('user_change', ({ user }) => {
    userMap[user.id] = user.name;
  });

  rtm.on('emoji_changed', ({ subtype, name, value, names }) => {
    if (subtype === 'add') {
      emojiMap[name] = value;
    } else if (subtype === 'remove') {
      names.forEach((name: string) => {
        delete emojiMap[name];
      });
    }
  });

  await Promise.all([rtm.start(), wsConnecting]);

  const [{ channels }, { members }, { emoji: emojiMap }] = await Promise.all([
    (web.channels.list() as unknown) as Promise<{ channels: { id: string; name: string }[] }>,
    (web.users.list() as unknown) as Promise<{ members: { id: string; name: string }[] }>,
    (web.emoji.list() as unknown) as Promise<{ emoji: Record<string, string> }>,
  ]);

  console.log('channels: %d', channels.length);
  console.log('users: %d', members.length);
  console.log('emoji: %d', Object.keys(emojiMap).length);

  channels.forEach(c => {
    channelMap[c.id] = c.name;
  });

  members.forEach(u => {
    userMap[u.id] = u.name;
  });

  rtm.on('message', m => {
    if (
      m.subtype ||
      !m.text ||
      (options.channel && m.channel !== options.channel && channelMap[m.channel] !== options.channel) ||
      (!options.thread && m.thread_ts) ||
      (!options.bot && m.bot_id)
    ) {
      return;
    }

    const tree = parse(m.text);
    const comment = render(tree, channelMap, userMap, emojiMap);
    send(comment);
  });
}
