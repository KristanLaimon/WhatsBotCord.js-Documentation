import type { IMsgWidget } from "../MsgWidget/MsgWidget.ts";

class MsgWidgetStore {
  public IsOnSidebar = $state<boolean>(false);

  public  ActiveRef = $state<IMsgWidget>();
}

const msgWidgetStoreInstance = new MsgWidgetStore();
export default msgWidgetStoreInstance;

