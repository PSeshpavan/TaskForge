import { Router } from "express";
import {
  createBoardController,
  listBoardsController,
  getBoardController,
  patchBoardController,
  deleteBoardController,
  addMemberController,
  updateMemberController,
  removeMemberController,
  listBoardMembersController,
} from "./boards.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validateBody";
import { validateParams } from "../../middleware/validateParams";
import {
  createBoardSchema,
  boardIdParam,
  updateBoardSchema,
  addMemberSchema,
  boardMemberIdParam,
  updateMemberRoleSchema,
} from "./boards.validation";
import { getActivities } from "../activity/activity.service";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createBoardSchema), createBoardController);
router.get("/", listBoardsController);
router.get("/:boardId", validateParams(boardIdParam), getBoardController);
router.patch("/:boardId", validateParams(boardIdParam), validateBody(updateBoardSchema), patchBoardController);
router.delete("/:boardId", validateParams(boardIdParam), deleteBoardController);
router.get("/:boardId/members", validateParams(boardIdParam), listBoardMembersController);

router.post("/:boardId/members", validateParams(boardIdParam), validateBody(addMemberSchema), addMemberController);
router.patch(
  "/:boardId/members/:memberId",
  validateParams(boardMemberIdParam),
  validateBody(updateMemberRoleSchema),
  updateMemberController
);
router.delete("/:boardId/members/:memberId", validateParams(boardMemberIdParam), removeMemberController);

router.get("/:boardId/activity", validateParams(boardIdParam), async (req, res, next) => {
  const func = "[boardsRouter] activityRoute";
  const { boardId } = req.params;
  console.log(`${func} start`, { boardId });
  try {
    const userId = (req as any).user.id;
    // simple access check
    const { assertBoardAccess } = await import("./boards.service");
    await assertBoardAccess(userId, boardId);
    const limit = Number(req.query.limit || 20);
    const activities = await getActivities(boardId, limit);
    console.log(`${func} success`, { boardId, limit, count: activities.length });
    return res.json({ activities });
  } catch (err) {
    console.error(`${func} error`, err);
    next(err);
  }
});

export const boardsRouter = router;
