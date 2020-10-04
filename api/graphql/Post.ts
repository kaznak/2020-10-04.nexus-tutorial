// api/graphql/Post.ts
import { objectType, extendType, intArg, stringArg } from "@nexus/schema";
import { Post as PostType } from "../db";

export const PostQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("drafts", {
      nullable: false,
      type: "Post",
      list: true,
      resolve(_root, _args, ctx) {
        return ctx.db.posts.filter((p: PostType) => p.published === false);
      },
    });
    t.list.field("posts", {
      type: "Post",
      resolve(_root, _args, ctx) {
        return ctx.db.posts.filter((p: PostType) => p.published === true);
      },
    });
  },
});

export const Post = objectType({
  name: "Post", // <- Name of your type
  definition(t) {
    t.int("id"); // <- Field named `id` of type `Int`
    t.string("title"); // <- Field named `title` of type `String`
    t.string("body"); // <- Field named `body` of type `String`
    t.boolean("published"); // <- Field named `published` of type `Boolean`
  },
});

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createDraft", {
      type: "Post",
      nullable: false,
      args: {
        title: stringArg({ required: true }),
        body: stringArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        const draft = {
          id: ctx.db.posts.length + 1,
          title: args.title,
          body: args.body,
          published: false,
        };
        ctx.db.posts.push(draft);
        return draft;
      },
    });
    t.field("publish", {
      type: "Post",
      args: {
        draftId: intArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        let draftToPublish = ctx.db.posts.find(
          (p: PostType) => p.id === args.draftId
        );
        if (!draftToPublish) {
          throw new Error("Could not find draft with id " + args.draftId);
        }
        draftToPublish.published = true;
        return draftToPublish;
      },
    });
  },
});
