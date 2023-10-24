import { defineComponent, h } from "vue";

export default defineComponent({
  emits: ["leave", "enter", "change", "disconnect"],
  name: "deferred",

  render() {
    return h(
      "div",
      {
        class: "placeholder",
      },
      this.hidden ? this.$slots : "",
    );
  },

  data: (): { observer: IntersectionObserver | null; loaded: boolean } => ({
    observer: null,
    loaded: false,
  }),

  props: {
    autoHide: {
      type: Boolean,
      default: true,
    },
    once: {
      type: Boolean,
      default: false,
    },
    threshold: {
      type: [Array<number>, Number],
      default: 0,
    },
    root: {
      type: Object,
      default: null,
    },
    rootMargin: {
      type: String,
      default: "0px 0px 0px 0px",
    },
  },

  computed: {
    hidden(): boolean {
      return this.autoHide ? this.loaded : true;
    },
  },

  mounted() {
    const option: IntersectionObserverInit = {
      threshold: this.threshold,
      rootMargin: this.rootMargin,
    };

    if (this.root !== null) {
      option["root"] = this.root as any;
    }

    this.observer = new IntersectionObserver(this.onElementObserved, option);
    this.observer?.observe(this.$el);
  },

  unmounted() {
    this.$emit("disconnect");
    this.observer?.disconnect();
  },

  methods: {
    onElementObserved(entries: IntersectionObserverEntry[]): void {
      entries.forEach(({ target, isIntersecting }) => {
        if (this.autoHide) {
          this.loaded = isIntersecting;
        }

        if (isIntersecting) {
          this.$emit("enter", target);

          if (this.once) {
            return this.observer?.unobserve(target);
          }
        } else {
          this.$emit("leave", target);
        }

        this.$emit("change", target);
      });
    },
  },
});
