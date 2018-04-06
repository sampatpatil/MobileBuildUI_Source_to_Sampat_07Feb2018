
define(

    [
        
    ],

    function () {

        'use strict';

        var AgilePointWidgetsWaiting = function (AP, $Block, Config) {

            // This widget is created as singleton in the View initialization

            this.$Block = $Block;
            this.visible = false;
            this.$Window = $(window);
            this.$Message = $Block.find('.Message');
            this.Message = '';
            this.AP = AP;
            AP.Controller.Events.Window.onResize.add(this.center, this);
            AP.Controller.Events.Model.onChangeCulture.add(this.translateMessage, this);
        };

        AgilePointWidgetsWaiting.prototype.show = function (Message) {


            this.setMessage(Message || '');

            if (!this.visible) {
                this.$Block.fadeIn();
                this.visible = true;
                this.center();
            }
        };

        AgilePointWidgetsWaiting.prototype.hide = function () {
            this.setMessage('');
            if (this.visible) {
                this.$Block.fadeOut();
                this.visible = false;
            }
        };

        AgilePointWidgetsWaiting.prototype.setMessage = function (Message) {

            if (Message != null) {
                this.Message = Message;
                this.translateMessage();
                this.center();
            };
        };

        AgilePointWidgetsWaiting.prototype.translateMessage = function () {

            var MessageKey = this.Message,
                Message = this.AP.View.Internationalize.translate(MessageKey);

            this.$Message.find('.Text').html(Message);
        };

        AgilePointWidgetsWaiting.prototype.center = function () {

            if (this.visible) {

                var WindowW = this.$Window.width(),
                    WindowH = this.$Window.height(),
                    MessageW = this.$Message.width(),
                    MessageH = this.$Message.height(),
                    MessageTop = (WindowH - MessageH) / 2,
                    MessageLeft = (WindowW - MessageW) / 2;

                this.$Message.css({ top: MessageTop + 'px', left: MessageLeft + 'px' });
            };
        };

        AgilePointWidgetsWaiting.prototype.destroy = function () {
        };

        return { name: 'Waiting', widget: AgilePointWidgetsWaiting };
    }
)
