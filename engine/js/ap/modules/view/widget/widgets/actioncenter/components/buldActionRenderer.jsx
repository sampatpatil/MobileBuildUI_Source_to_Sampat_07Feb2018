/** @jsx React.DOM */
define(['react'], function(React) {
        return {
            getComponent: function(AP) {
            	var types = {notification: 'notification',
				bulkAction: 'bulkAction',
				action: 'action',
				error: 'error'
				},
				status = { notstartetd: -1, stopped: 0, running: 1, completed: 2 },
				ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
			bulkAction = React.createClass({
				getInitialState: function() {
					var msg = this.props.msg,
						actualQueue = msg.actualQueue || msg.queue || [];
					return {
						title: msg.title,
						messageTempl:msg.messageTempl,
						message: msg.message,
						action: msg.action,
						actualQueue: actualQueue,
						total: actualQueue.length,
						queue: msg.queue,
						current: msg.current,
						succeeded: msg.succeeded || [],
						failed: msg.failed ||+ [],
						status: msg.status == null ? status.notstartetd : msg.status,
						progress: msg.progress || 0,
						type: 'bulkAction',
						resumable: msg.resumable || false,
						pausable: msg.pausable || false,
						statusStr: ''
					};
				},
				msg: null,
				componentWillMount: function() {	
					this._localState = this.getInitialState();
				},
				componentDidMount: function() {
					this.props.autoStart && this.start();
					this.calculateProgress();
				},
				setStatusStr: function() {
					var res = 'stopped';
					switch (this._localState.status) {
						case status.completed:
						case status.running:
							var succeeded = this._localState.succeeded.length,
								failed = this._localState.failed.length;
							res = failed ? kendo.format('{0}/{1} {2} {3} {4}', succeeded, this._localState.total, 'completed', failed, 'failed') : kendo.format('{0}/{1} {2}', succeeded, this._localState.total, 'completed');
							break;
					}
					this.setLocalState({
						statusStr: res
					});
				},
				_localState:null,
				setLocalState:function(state){
					this._localState =  $.extend(this._localState||{},state);
					this.commitState();
				},
				commitState:function(){
					this.setState(this._localState);
				},
				calculateProgress: function() {
					var value = Math.ceil((1 - (this._localState.queue.length / this._localState.total)) * 100.0);
					var stat = this._localState.status;
					this.setLocalState({
						progress: value,
						resumable: stat == status.notstartetd || (stat != status.completed && stat != status.running),
						pausable: stat == status.running
					});
				},
				_on1Complete: function() {
					this._localState.current && this._localState.succeeded.push(this._localState.current);
					this.commitState();
					this.next();
					AP.ActionCenter.notifyPartialComplete();
				},
				_on1Failed: function() {
					this._localState.current && this._localState.failed.push(this._localState.current);
					this.commitState();
					this.next();
					AP.ActionCenter.notifyPartialComplete();
				},
				next: function() {
					var state = this._localState;
					if (state.status == status.stopped) return;
					state.current = null;
					this.calculateProgress();
					this.setStatusStr();
					if (state.queue.length == 0) {
						//msg.completed && msg.completed.call(this);
						this.setLocalState({
							status: status.completed
						});
						AP.ActionCenter.notifyComplete();
						this.calculateProgress();
						this.setStatusStr();
						return;
					}
					this.setLocalState({current :state.queue.shift()});
					this.restartCurrent();
				},
				restartCurrent: function() {
					if (!this._localState.current) return;
					this.setLocalState({
						status: status.running
					});
					AP.ActionCenter.notifyStart();
					AP.Controller.route(this._localState.action, {
						data: this._localState.current,
						success: $.proxy(this._on1Complete, this),
						error: $.proxy(this._on1Failed, this)
					});
				},
				start: function() {
					if (this._localState.current) {
						this.restartCurrent();
						return;
					}
					if (this._localState.queue.length < 1) return;
					this.next();
				},
				resume: function() {
					this.setLocalState({
						status: status.running
					});
					this.next();
					this.calculateProgress();
				},
				pause: function() {
					var state = this._localState;
					this.setLocalState({
						status: status.stopped
					});
					state.current && state.queue.unshift(state.current);
					state.current = null;
					this.calculateProgress();
				},
				remove: function() {
					//this will be overridden in parent
				},
				render: function() {
					var resumeButtonStyle = {
							display: this.state.resumable ? 'block' : 'none'
						},
						pauseButtonStyle = {
							display: this.state.pausable ? 'block' : 'none'
						},
						progressbarStyle = {
							display: this.state.progress > 0 ? 'block' : 'none',
							width: '90%'
						},
						progressStyle = {
							display: 'block',
							width: this.state.progress + '%'
						};
                                return (/*<transform>bulkAction.html</transform>*/);
				}

			});

			var notificationPanel = React.createClass({				
				remove: function(item) {
					var idx = this.props.items.indexOf(item);
					if (idx == -1) return;
					this.props.items.splice(idx, 1);
					this.setProps({
						items: this.props.items
					});									
				},
				componentDidMount:function(){
					//console.log(this.props.children);
				},
				componentDidUpdate: function() {
					AP.ActionCenter.save();
				},
				statics: {
					isMounted:function(item){
						return item.isMounted();
					},
					reg: new RegExp('(action)', 'gi'),
					isActionType: function(item) {
						return this.reg.test(item.type);
					},
					types: {						
						notification: function(context, item) {

						},
						bulkAction: function(context, item) {
							//if an item is an action and is not started yet, then start it.
							var start = notificationPanel.isActionType(item) && (item.status == status.notstartetd);
							return <bulkAction key={item.id} msg={item} autoStart={start} remove={context.remove.bind(context,item)}/>;
						},
						action: 'action',
						error: 'error'
					},
					getRenderer: function(context, item) {
						return this.types[item.type].apply(this, arguments);
					}
				},
				getData: function() {
					return (this.renderedChildren.length && notificationPanel.isMounted(this.renderedChildren[0]) && this.renderedChildren.map(function(child) {
						return child.state;
					})) || [];
				},
				renderedChildren:[],
				render: function() {
					var me = this;
					me.renderedChildren=[];
					var items = this.props.items.map(function(item) {
									var item = notificationPanel.getRenderer(me, item);
									 me.renderedChildren.push(item);
									 return item;
								});
					return (
						<div className="items-container">		
							{items}
						</div>
				);
				}
			});
			return {
				bulkAction: bulkAction,
				notificationPanel:notificationPanel
			};
		}
	};

});