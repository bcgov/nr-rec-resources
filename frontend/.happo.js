import { RemoteBrowserTarget } from 'happo.io';
import dotenv from 'dotenv';
dotenv.config();

const VIEWPORT = '1366x768';
const MAXHEIGHT = 20000;

module.exports = {
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  project: process.env.HAPPO_PROJECT,
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    }),
    firefox: new RemoteBrowserTarget('firefox', {
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    }),
    safari: new RemoteBrowserTarget('safari', {
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    }),
    edge: new RemoteBrowserTarget('edge', {
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    }),
  },
};
