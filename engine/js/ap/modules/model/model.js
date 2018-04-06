
define(

    [
        'ap/modules/model/dependantmethods',			// Methods for kendo data binding	
        'ap/modules/model/datasource',					// Query > Kendo DataSource Adapter	
        'ap/modules/model/eventModel',
        'async',
        'lib/modules/utilities'
    ],

    function (
        DependantMethods,
        DataSource,
        eventModel,
        async,
        utils
    ) {

        'use strict';

        var completionTracker = function (count, complete) {
            var track = 0;
            this.step = function (args) {
                track++;
                if (track == count && complete != null)
                    complete.apply(this, arguments);
            }
        }, repeat = function (str, n) {
            return (new Array(n + 1)).join(str);
        },
        lpad = function (str, minLen, ch) {
            ch = ch || ' ';
            return (str.length < minLen) ? repeat(ch, minLen - str.length) + str : str;
        },
        pad = function pad(n, minLength) {
            return lpad('' + n, minLength, '0');
        };

        var AP;				// Here





        //Walks through the blocks array to find if there is any external blocks are referenced. If found it
        //merges the blocks to the parent block.
        var _startWalkThruBlocks = function (Args, ParentBlock, done) {
            var me = this;
            if (ParentBlock.Blocks && ParentBlock.Blocks.length == 1 && _.isString(_.first(ParentBlock.Blocks)))
                /*If first block is a string that represents external blocks then compile the new block and merge the blocks
                back to the ParentBlock's Blocks;
                \*/
                me.compileDNA($.extend(true, {}, Args,
                    {
                        Path: _.first(ParentBlock.Blocks)
                    }), function (compiledBlock) {
                        ParentBlock.Blocks = compiledBlock.Blocks;
                        done && done(ParentBlock);
                    });
            else if (ParentBlock.Blocks) {
                var parentsBlocks = ParentBlock.Blocks;
                ParentBlock.Blocks = [];
                async.eachSeries(parentsBlocks, function (Block, next) {
                    _walkThruBlocks.call(me, Args, Block, function (compiledBlock) {
                        compiledBlock && ParentBlock.Blocks.push(compiledBlock);
                        next();
                    });
                }, function () {
                    done && done(ParentBlock);
                });
            }
            else done && done(ParentBlock);
        },

        // Walks through the block  to check whether the block can be rendered or skipped based  on current user access rights
         _walkThruBlocks = function (Args, ParentBlock, done) {
             var me = this;
             AP.Controller.AccessRightsHandler.canRenderBlock(ParentBlock.accessCode, function (res) {
                 res.result ? _startWalkThruBlocks.call(me, Args, ParentBlock, done) : (done && done(null));
             });
         },
        AgilePointModel = kendo.Class.extend({
            init: function (AgilePoint) {

                AP = AgilePoint;
                // Defaults				
                this.BlockIdPrefix = AP.Config.Data.Prefix;						// Block id generation prefix
                this.BlockTrailsId = 4;											// 0s in 000x id
                this.BlockIndexId = 0; 											// Sequence starts at 0 for root level

                // Submodules
                this.DataSource = new DataSource(AP); // Query > Kendo DataSource Adapter	
                this.DependantMethods = new DependantMethods(AP);
                this.EventTree = eventModel.createEVM(AP);
                // Initialize Kendo ViewModel
                this.initViewModelBase();

                // Create top level block
                this.MainBlockId = this.BlockIdPrefix + 'Main';
                this._dataBuffer = [];

                // Queue for keep track of  chained async loads
                this.LoadDNAQueue = [];
            },
            start: function (completed) {
                this.addNewBlock({ Id: this.MainBlockId }, '');
            },

            // ------------------------------------------------------------------------------------
            // DataSource

            getDataSource: function (QueryId, ExtraData) {

                var Query = AP.Config.Queries[QueryId],
                    DataSource = this.DataSource.getDataSource(Query, ExtraData),
                    KendoDataSource = new kendo.data.DataSource(DataSource.DataSource);

                return KendoDataSource;
            },

            // ------------------------------------------------------------------------------------
            // ViewModel Base

            ViewModelBase: {
                Blocks: {},			// App blocks
                State: {			// APP State
                    Interface: ['mainmenuclosed'],	// State classes list rendered in Main DOM Element 
                    Data: {},		// App Data states (navigation path, etc) in pairs key / value
                    Query: {}		// Query data slot, save last query of a given id
                }
            },

            initViewModelBase: function () {

                /// Local storage saved state
                if (AP.Config.Data.SaveState) {
                    var SavedState = localStorage.getItem('AP_State');
                    if (SavedState) {

                        try {
                            this.ViewModelBase.State = JSON.parse(SavedState);
                        } catch (e) { } // pass corrupt State
                    };
                }

                $.extend(this.ViewModelBase, this.DependantMethods.ViewModelMethods);
                this.ViewModel = new kendo.data.ObservableObject(this.ViewModelBase);
            },

            // ------------------------------------------------------------------------------------
            // ViewModel State management

            state: function (Args, Slot, Verb, Name, Value) {

                var State = this.ViewModel.get('State');

                switch (Slot) {

                    case 'All':

                        switch (Verb) {

                            case 'init':

                                State.set('Interface', []);
                                State.set('Data', {});
                                break;
                        };
                        break;

                    case 'Interface':

                        var InterfaceSlot = State.get('Interface'), oldInterfaces = InterfaceSlot.toJSON(),
                            length = InterfaceSlot.length,
                            StateIndex = InterfaceSlot.indexOf(Name),
                            StateSet = StateIndex != -1;

                        switch (Verb) {

                            case 'add':

                                if (!StateSet) { InterfaceSlot.push(Name); };
                                break;

                            case 'remove':

                                if (StateSet) { InterfaceSlot.splice(StateIndex, 1); };
                                break;

                            case 'toggle':

                                if (StateSet) { InterfaceSlot.splice(StateIndex, 1); }
                                else { InterfaceSlot.push(Name); };
                                break;
                        }

                        (length != InterfaceSlot.length) && AP.Controller.Events.Model.onInterfaceStateChange.dispatch(oldInterfaces, InterfaceSlot.toJSON());
                        break;

                    case 'Data':

                        var DataSlot = State.get('Data');

                        switch (Verb) {

                            case 'set':

                                DataSlot.set(Name, Value);
                                break;
                        };
                        break;
                }

                try {


                    var StateObj = this.ViewModel.get('State').toJSON(),
                        StateStr = JSON.stringify(StateObj);

                    localStorage.setItem('AP_State', StateStr);
                } catch (e) {
                    if (AP.Config.Data.DEBUG) console.error(e);
                }
            },

            // ------------------------------------------------------------------------------------
            // ViewModel Blocks management

            getBlock: function (BlockId) {
                try {
                    return this.ViewModel.get('Blocks.' + BlockId);
                }
                catch (e) { return null; }
            },

            // Block id generation

            // Format block id
            formatBlockId: function (IndexNumber) {

                var Id = this.BlockIdPrefix + pad(IndexNumber, this.BlockTrailsId);
                return Id;
            },

            // Calculate new block id			
            getNewBlockId: function () {

                var Index = 0;
                while (this.getBlock(this.formatBlockId(Index))) { Index++ };

                return this.formatBlockId(Index);
            },

            /// Recursive delete of blocks			
            removeChildBlocks: function (BlockId) {

                var Block = this.getBlock(BlockId);
                if (!Block) return;
                var ChildBlocks = Block.get('Blocks');
                if (ChildBlocks && ChildBlocks.length > 0) {
                    var ChildBlockId;
                    while (ChildBlockId = ChildBlocks.shift()) {
                        this.removeBlock(ChildBlockId);
                    }
                }
            },

            // Remove a block			
            removeBlock: function (BlockId) {
                this.removeChildBlocks(BlockId);
                var block = this.getBlock(BlockId);
                if (block) {
                    var parentId = block.ParentId;
                    var parent = this.getBlock(parentId);
                    parent && parent.Blocks && parent.Blocks.remove && parent.Blocks.remove(BlockId);
                }
                delete this.ViewModel.Blocks[BlockId];
            },

            _dataBuffer: null,

            _addDataToBuffer: function (TargetId, NewBlocksIdList, Replace, Path) {
                var data = { TargetId: TargetId, NewBlocksIdList: NewBlocksIdList, Replace: Replace, Path: Path };
                this._dataBuffer.push(data);
                return data;
            },

            _processDataBuffer: function () {
                var me = this, deferred = $.Deferred();
                async.eachSeries(this._dataBuffer, function (data, next) {

                    AP.Controller.Events.Model.onNewData.dispatch(data.TargetId, data.NewBlocksIdList, data.Replace, data.Path, function () {
                        // Shift this chunk from load queue
                        me.shiftLoadDNAQueue(data.Path);
                        //Allow current execution stact to complete and give some time for UI to keep responsive
                        async.nextTick(next);
                    });

                }, function () {
                    me._dataBuffer = [];
                    deferred.resolve();
                });
                return deferred.promise();
            },

            // Asyncronously Add/Actualize blocks in ViewModel.Blocks			
            addNewChunkAsync: function (TargetId, BlocksChunk, Path) {

                var deferred = $.Deferred(), me = this, TargetId = TargetId || me.MainBlockId,
                    Replace = BlocksChunk.Replace == undefined ? true : BlocksChunk.Replace,
                    NewBlocksIdList = []; // keep track of new blocks added

                // Clean child blocks if Replace
                if (Replace) { this.removeChildBlocks(TargetId); }

                // onNewData event 
                var data = me._addDataToBuffer(TargetId, NewBlocksIdList, Replace, Path);

                // Add new blocks to ViewModel
                if (BlocksChunk.Blocks) {

                    async.eachSeries(BlocksChunk.Blocks, function (Block, next) {

                        me.addNewBlockAsync(Block, TargetId)
                            .done(function (NewBlockId) {
                                NewBlockId && NewBlocksIdList.push(NewBlockId);
                                next();
                            });


                    }, function () {
                        data.NewBlocksIdList = NewBlocksIdList;
                        deferred.resolve();
                    });

                }
                else deferred.resolve();

                return deferred.promise();
            },

            // Asyncronous recursive creation of blocks			 
            addNewBlockAsync: function (Block, TargetId, completed, DNAArgs) {
                var me = this, deferred = $.Deferred();

                if (_.isString(Block)) {

                    if (!Block) {
                        AP.Config.DEBUG && console.error('Partial Block path cannot be null');
                        throw new Error('Partial Block path cannot be null');
                    }

                    this.fetchDNA({ Path: Block, TargetId: TargetId }, function (data) {
                        me.addNewChunkAsync(TargetId, data($.extend({ parameters: {} }, DNAArgs || {})), Block)
                            .done(function () {
                                deferred.resolve();
                            });
                    });

                }
                else {

                    AP.Controller.AccessRightsHandler.canRenderBlock(Block.accessCode, function (res) {

                        if (!res.result) {
                            deferred.resolve(false);
                            return;
                        }

                        var NewBlockId = Block.Id || me.getNewBlockId(),
                        TargetBlock = me.getBlock(TargetId);//|| this.MainBlockId;
                        // Add new block id to target blocks list
                        if (TargetBlock) {
                            if (!TargetBlock.get('Blocks')) { TargetBlock.set('Blocks', []); };

                            var TargetChildBlocks = TargetBlock.get('Blocks');
                            TargetChildBlocks.push(NewBlockId);
                        }
                        // New block template
                        var NewBlock = {
                            Id: NewBlockId,
                            ParentId: TargetId
                        };

                        // New Block attrs. Ignore blocks
                        for (var Attr in Block) {
                            if (Attr != 'Blocks') { NewBlock[Attr] = Block[Attr]; };
                        };

                        // Add new block to AP.Model.ViewModel
                        var NewBlockPath = 'Blocks.' + NewBlockId;
                        me.ViewModel.set(NewBlockPath, NewBlock);

                        // Create child blocks
                        if (Block.Blocks && Block.Blocks.length) {
                            /*var tracker = new completionTracker(Block.Blocks.length, completed);*/
                            async.eachSeries(Block.Blocks, function (ChildBlock, next) {
                                me.addNewBlockAsync(ChildBlock, NewBlockId, null, DNAArgs)
                                .done(function () {

                                    next();

                                });
                            }, function () {
                                deferred.resolve(NewBlockId)
                            });

                        } else deferred.resolve(NewBlockId);
                    });

                }

                return deferred.promise();
            },

            // Recursive creation of blocks			 
            addNewBlock: function (Block, TargetId, completed, DNAArgs) {
                if (typeof Block == 'string' && Block != '') { // Autoload chunk
                    this.loadDNA({ Path: Block, TargetId: TargetId, completed: completed, parameters: (DNAArgs || {}).parameters });
                    return null;
                }

                var me = this, NewBlockId = Block.Id || this.getNewBlockId(),
                    TargetBlock = this.getBlock(TargetId);//|| this.MainBlockId;
                // Add new block id to target blocks list
                if (TargetBlock) {
                    if (!TargetBlock.get('Blocks')) { TargetBlock.set('Blocks', []); };

                    var TargetChildBlocks = TargetBlock.get('Blocks');
                    TargetChildBlocks.push(NewBlockId);
                }
                // New block template
                var NewBlock = {
                    Id: NewBlockId,
                    ParentId: TargetId
                };

                // New Block attrs. Ignore blocks
                for (var Attr in Block) {
                    if (Attr != 'Blocks') { NewBlock[Attr] = Block[Attr]; };
                };

                // Add new block to AP.Model.ViewModel
                var NewBlockPath = 'Blocks.' + NewBlockId;
                this.ViewModel.set(NewBlockPath, NewBlock);

                // Create child blocks
                if (Block.Blocks && Block.Blocks.length) {
                    /*var tracker = new completionTracker(Block.Blocks.length, completed);*/
                    for (var ChildBlockIndex in Block.Blocks) {

                        var ChildBlock = Block.Blocks[ChildBlockIndex];
                        me.addNewBlock(ChildBlock, NewBlockId, null, DNAArgs);
                    };

                } /*else if (completed != null)
                completed(NewBlockId);*/


                return NewBlockId;
            },

            // Add/Actualize blocks in ViewModel.Blocks			
            addNewChunk: function (TargetId, BlocksChunk, Path) {

                var TargetId = TargetId || this.MainBlockId,
                    Replace = BlocksChunk.Replace == undefined ? true : BlocksChunk.Replace,
                    NewBlocksIdList = []; // keep track of new blocks added

                // Clean child blocks if Replace
                if (Replace) { this.removeChildBlocks(TargetId); };

                // Add new blocks to ViewModel
                if (BlocksChunk.Blocks) {

                    for (var BlockIndex in BlocksChunk.Blocks) {

                        var Block = BlocksChunk.Blocks[BlockIndex],
                        NewBlockId = this.addNewBlock(Block, TargetId);

                        if (NewBlockId) {
                            NewBlocksIdList.push(NewBlockId);
                        };
                    }

                }

                // onNewData event 
                AP.Controller.Events.Model.onNewData.dispatch(TargetId, NewBlocksIdList, Replace, Path);

                // Shift this chunk from load queue
                this.shiftLoadDNAQueue(Path);
            },

            // ------------------------------------------------------------------------------------
            // Loading chunks

            // Remove an element of the load queue
            shiftLoadDNAQueue: function (Path) {

                var ElIndex = this.LoadDNAQueue.indexOf(Path),
                    El = this.LoadDNAQueue.splice(ElIndex, 1),
                    QueueLength = this.LoadDNAQueue.length;

                // onQueueComplete event 
                if (QueueLength == 0) { AP.Controller.Events.Model.onDataQueueComplete.dispatch(Path); };
            },
            // Compiles specified dna module and all its children module into one Block
            compileDNA: function (Args, callback) {
                var me = this;
                this.fetchDNA(Args, function (blockGetter) {
                    var Block = blockGetter(Args);
                    _walkThruBlocks.call(me, Args, Block, callback);
                });
            },

            // Loads specified dna module			
            fetchDNA: function (Args, callback) {
                var Path = Args.Path != undefined ? Args.Path || 'home' : 'home',
                  //DNAFilesExt = '.js',
                  //DNACache = false, // true for production
                  AppDNAPath = 'dna/',
                  Url = AppDNAPath + Path;// + DNAFilesExt;


                require([Url], callback);
            },

            // Load a chunk of View Blocks definition into the ViewModel			
            loadDNA: function (Args, callback) {
                var Path = Args.Path != undefined ? Args.Path || 'home' : 'home', TargetId = Args.TargetId;
                AP.Model.LoadDNAQueue.push(Path);
                var me = this;
                Args.parameters = Args.parameters || {};
                this.compileDNA(Args, function (data) {
                    //TODO: Make rendering of blocks asynncronous keep the UI responsive while loading UI
                    if (AP.Config.Data.asyncRender) {
                        me.addNewChunkAsync(TargetId, data, Path)
                            .done(function () {
                                me._processDataBuffer().done(function () {
                                    AP.View.renderFromBuffer(Args.completed);
                                });
                            });
                    }
                    else {
                        me.addNewChunk(TargetId, data, Path);
                        Args.completed && Args.completed((data.Blocks && data.Blocks.length > 0)); // check the compiled DNA has its subblock or not
                    }
                });
            }
        });

        return AgilePointModel;
    }
);

