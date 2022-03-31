import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleLeft,
  faCheck,
  faEllipsisH,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  Button,
  ConfigProgrammatic,
  Dropdown,
  Icon,
  Input,
  Loading,
  Toast,
} from "buefy";
import Vue from "vue";

library.add(faAngleLeft, faCheck, faEllipsisH, faPlus, faSearch, faTimes);
Vue.component("VueFontawesome", FontAwesomeIcon);
Vue.use(Button);
Vue.use(ConfigProgrammatic);
Vue.use(Dropdown);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Loading);
Vue.use(Toast);

ConfigProgrammatic.setOptions({
  defaultIconComponent: "vue-fontawesome",
  defaultIconPack: "fas",
});
