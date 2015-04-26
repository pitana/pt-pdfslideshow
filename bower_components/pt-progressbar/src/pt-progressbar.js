/**
 * Created by narendra on 14/3/15.
 */

pitana.register({
  tagName: "pt-progressbar",
  template: document._currentScript.ownerDocument.querySelector("template"),
  accessors: {
    active:{
      type:"boolean"
    },
    striped:{
      type:"boolean"
    },
    intermediate:{
      type:"boolean"
    },
    showActualValue:{
      type:"boolean"
    },
    showStatus:{
      type:"boolean"
    },
    value: {
      default: 0,
      type: "int",
      onChange: "render"
    },
    min: {
      default: 0,
      type: "int",
      onChange: "render"
    },
    max: {
      default: 100,
      type: "int",
      onChange: "render"
    },
    type: {
      default: "defaults",
      type:"string"
    }
  },
  methods: ["toggle"],
  toggle: function (attr) {
    var togglable = ["showStatus", "striped" , "active", "showActualValue", "intermediate" ];
    if(togglable.indexOf(attr) !== -1){
      this.$[attr] = !this.$[attr]
    }
  },
  attachedCallback: function () {
    this.bar = this.$.querySelector(".progress-bar");
    this.status = this.$.querySelector("span.status");
    this.render();
  },
  render: function () {
    var value = this.$.value;
    var min = this.$.min;
    var max = this.$.max;

    var p = ((value - min)/(max - min) * 100);
    if(p>100){
      p = 100;
    }
    if(p<0){
      p = 0;
    }
    this.bar.style.width = p + "%";
    this.status.innerHTML = '<span class="percentage">'+ p +'%</span><span class="value">'+ value + '</span>';
  }
});