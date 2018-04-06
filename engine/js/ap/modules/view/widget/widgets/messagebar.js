
define(

    [
        'ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';
        // A list of buttons

        var AgilePointWidgetsMessageBar = basewidget.extend({
            onInit: function (AP, BlockId) {


                var Me = this;

                this.$ParentBlock = $('[data-id="' + BlockId + '"]');

                this.$ParentBlock
				.append(AP.View.Templates.renderTemplate('widget/messagebar', { BlockId: BlockId }))
				.find('.APWidget')
				.data('APWidget', this)
				.find('a[data-action="hide"]')
				.on('click', function (e) { Me.hide(); return false; });

                this.$Block = this.$ParentBlock.find('.APWidget');
                this.$MessageField = this.$Block.find('.Message');

                this.Message = null;
                this.MessageType = '';

                // Translation on buttons, messagebar, etc... 
                AP.Controller.Events.Model.onChangeCulture.add(this.translateTexts, this);
                this.translateTexts();
            },

            hide: function () {

                this.$ParentBlock.removeClass('HasMessageBar');
                this.$Block.hide();
            },

            displayMessage: function (Message) {

                this.MessageType = 'Message';
                this.display(Message);
            },

            displayErrors: function (Message) {

                this.MessageType = 'Errors';
                this.display(Message);
            },

            display: function (Message) {

                this.Message = Message;

                this.$MessageField.removeClass('Message Errors');
                this.$MessageField.addClass(this.MessageType);
                this.$ParentBlock.addClass('HasMessageBar');
                this.displayText();
                this.$Block.show();
            },

            displayText: function () {

                this.$MessageField.html(this.AP.View.Internationalize.translate(this.Message));
            },

            translateTexts: function () {

                // Message 
                if (this.Message) { this.displayText(); };

                // Buttons// Tool bar buttons
                this.$Block.find('*[data-text-key]')
				.each(function () {

				    var $this = $(this),
						KeyText = $this.attr('data-text-key'),
						Text = this.AP.View.Internationalize.translate(KeyText);

				    $this.html(Text);
				});
            }
        });

        return { name: 'MessageBar', widget: AgilePointWidgetsMessageBar };
    }
);
