import { app } from 'electron';

export default () => {
	app.setAsDefaultProtocolClient('relagit');
};
