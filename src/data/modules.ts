import type { Module, Topic } from './types';
import { modules101to103 } from './modules-101-103';
import { modules104to106 } from './modules-104-106';
import { modules107to110 } from './modules-107-110';

export const topics: Topic[] = [
  { id: '101', title: 'System Architecture' },
  { id: '102', title: 'Linux Installation and Package Management' },
  { id: '103', title: 'GNU and Unix Commands' },
  { id: '104', title: 'Devices, Linux Filesystems, FHS' },
  { id: '105', title: 'Shells and Shell Scripting' },
  { id: '106', title: 'User Interfaces and Desktops' },
  { id: '107', title: 'Administrative Tasks' },
  { id: '108', title: 'Essential System Services' },
  { id: '109', title: 'Networking Fundamentals' },
  { id: '110', title: 'Security' },
];

export const modules: Module[] = [
  ...modules101to103,
  ...modules104to106,
  ...modules107to110,
];

export const totalExercises = modules.reduce((sum, m) => sum + m.exercises.length, 0);

/** Total practice items across the whole app: command exercises plus concept quizzes. */
export const totalItems = modules.reduce(
  (sum, m) => sum + m.exercises.length + (m.quizzes?.length ?? 0),
  0,
);

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getModulesByTopic(topicId: string): Module[] {
  return modules.filter((m) => m.topicId === topicId);
}
