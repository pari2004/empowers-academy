-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "priority",
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "Priority";

