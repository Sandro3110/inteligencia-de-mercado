import { relations } from "drizzle-orm/relations";
import { projects, enrichmentQueue, users, notifications } from "./schema";

export const enrichmentQueueRelations = relations(enrichmentQueue, ({one}) => ({
	project: one(projects, {
		fields: [enrichmentQueue.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	enrichmentQueues: many(enrichmentQueue),
	notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [notifications.projectId],
		references: [projects.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	notifications: many(notifications),
}));