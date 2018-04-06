define(function () {

    return function (Args) {
        return {
            Master: 'root',
            accessCode: 'SysAdmin',
            Blocks: [
                {
                    ExBlocksClass: 'MyAppsContainer',
                    Replace: true,
                    Blocks: [
                        {
                            Blocks: [
                                {
                                    ExBlocksClass: 'AnnouncementList',
                                    Blocks: [
                                        {
                                            Fields: [
                                                {
                                                    Class: 'TitleHeader',
                                                    Text: 'sections.announcement.title'
                                                }
                                            ]
                                        },
                                        {
                                            Name: 'AnnouncementList',
                                            ExClass: 'AnnouncementListContainer',
                                            Widget: {
                                                Type: 'APGrid',
                                                QueryId: 'CMADataStore',
                                                Config: {
                                                    actionFilters: [
                                                        {
                                                            action: 'PublishSelected',
                                                            minCount: 1,
                                                            condition: 'all',
                                                            filter: {
                                                                filters: [{ field: 'Status', operator: 'eq', value: 0 }]
                                                            }
                                                        },
                                                        {
                                                            action: 'UnpublishSelected',
                                                            minCount: 1,
                                                            condition: 'all',
                                                            filter: {
                                                                filters: [{ field: 'Status', operator: 'eq', value: 1 }]
                                                            }
                                                        },
                                                        {
                                                            action: 'EditSelected',
                                                            maxLength: 1,
                                                            condition: 'none'
                                                        }
                                                    ],
                                                    activateButtons: ['CreateAnnouncement'],
                                                    autoBind: false,
                                                    checkable: false,
                                                    toolbar: [
                                                        {
                                                            action: 'CreateAnnouncement',
                                                            iconRequired: false,
                                                            showText: true,
                                                            text: 'Create'
                                                        },
                                                        {
                                                            action: 'EditSelected',
                                                            iconRequired: false,
                                                            showText: true,
                                                            text: 'Edit'
                                                        },
                                                        //{
                                                        //    action: 'PublishSelected',
                                                        //    iconRequired: false,
                                                        //    showText: true,
                                                        //    text: 'Publish'
                                                        //},
                                                        //{
                                                        //    action: 'UnpublishSelected',
                                                        //    iconRequired: false,
                                                        //    showText: true,
                                                        //    text: 'Unpublish'
                                                        //}
                                                    ],
                                                    columns: [
                                                        {
                                                            field: "Title",
                                                            title: "Title",
                                                            width: 165,
                                                            groupable:false
                                                        },
                                                        {
                                                            field: "SubTitle",
                                                            title: "Date",
                                                            width: 165,
                                                            groupable: false
                                                        },
                                                        /*{
                                                            field: "Category",
                                                            title: "Category",
                                                            width: 165
                                                        },*/
                                                        {
                                                            field: "Platforms",
                                                            title: "Platforms",
                                                            width: 165
                                                        },
                                                        {
                                                            field: "Status",
                                                            title: "Status",
                                                            values: [
                                                                { text: 'Draft', value: 0 },
                                                                { text: 'Published', value: 1 }
                                                            ],
                                                            width: 100
                                                        },
                                                        {
                                                            field: "Content",
                                                            title: "Content",
                                                            encoded:false, //to display HTML content -- Phani
                                                            groupable: false
                                                        }
                                                    ],
                                                    sortable: true,
                                                    groupable: true,
                                                    selectable: 'multiple, row',
                                                    pageable: true
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
});