import { GlazeWmOutput } from 'zebar';
import { ContainerType } from '../../WindowTitle';

type Container = GlazeWmOutput['focusedContainer'];
type MyWindow = Extract<Container, { type: ContainerType.WINDOW }>;

export function isWindow(container: Container): container is MyWindow {
  return container.type === ContainerType.WINDOW;
}
