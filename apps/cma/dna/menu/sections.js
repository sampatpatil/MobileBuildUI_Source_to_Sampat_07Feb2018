define([], function () {
    return function (Args) {
        //debugger;
        var AP = Args.AP;

        var menuItemBlocks = [], menuIcon = { DOM: 'span', Class: 'MenuIcon' },
            menuItem = function (text, href, menuIcon, target, accessCode, locked, items, extraClass) {
                return { text: text, href: href, iconCls: menuIcon, target: target || '', accessCode: accessCode || '', locked: false, items: items || [], extraCls: extraClass || '' };
            },
            applicationmgmtMenus = [],
            runtimeMenus = [
                menuItem('sections.runtimemanagement.processes.title.processes', '#sections/runtimemanagement/processes', '', '', '', false),
                menuItem('sections.runtimemanagement.processes.title.tasks', '#sections/runtimemanagement/tasks', '', '', '', false),
                menuItem('sections.runtimemanagement.processes.title.notifications', '#sections/runtimemanagement/notifications', '', '', 'Notifications'),
                //menuItem('sections.runtimemanagement.processes.title.notifications', '#sections/processadaptation', '', '', 'false')
            ],
            accessControlMenus = [
                menuItem('sections.accesscontrol.users.title', '#sections/accesscontrol/users', '', '', 'Users'),
                menuItem('sections.accesscontrol.groups.title', '#sections/accesscontrol/groups', '', '', 'Groups'),
                menuItem('sections.accesscontrol.roles.title', '#sections/accesscontrol/roles', '', '', 'Roles'),
                menuItem('sections.accesscontrol.delegations.title', '#sections/accesscontrol/delegations', '', '', 'Delegations'),

            ],
            sysMenus = [
                menuItem('sections.system.performance.title', '#sections/system/performance', '', '', 'ModifyViewSytemConfig')
            ],
            appbuilderMenus = [
                menuItem('sections.appbuilder.sharedcustomattributes.title', '#sections/appbuilder/sharedcustomattributes', '', '', 'SharedVariables', false),
                menuItem('sections.appbuilder.globalemailtemplates.title', '#sections/appbuilder/globalemailtemplates', ''),
                menuItem('sections.appbuilder.tokenmanagement.titles', '#sections/appbuilder/globalapptoken', '', '', 'ViewGlobalAccessToken'),
                menuItem('sections.system.eformssettings.title', '#sections/appbuilder/eformssettings', '', '', 'ViewGlobalAccessToken'),
                // menuItem('sections.appbuilder.lookupmanagement.title', '#sections/appbuilder/lookups', '')
            ];


        if (AP.Config.Data.isOrganizationFrameworkEnabled) {
            accessControlMenus.push(menuItem('sections.org.orgtitle', '#sections/org', '', ''));
        }
        applicationmgmtMenus.push(menuItem('sections.applicationmanagement.title', '#sections/applicationmanagement/management', '', '', 'Application Management'));

        if (AP.Config.Data.ROLE_BASED_SECURITY_ENABLED) {
            applicationmgmtMenus.push(menuItem('sections.applicationpermissions.title', '#sections/applicationpermissions/apppermissions', '', '', 'ManagePermissionSettings'));
        }

        menuItemBlocks.push(menuItem('menu.welcometext', '#sections/Welcome', 'myApp', ''));
        menuItemBlocks.push(menuItem('menu.createNewApp', '#sections/addApp/addNewApp', 'myApp', ''));
        menuItemBlocks.push(menuItem('menu.myApps', '#sections/myApps', 'home', ''));
        menuItemBlocks.push(menuItem('menu.archive', '#sections/archive', 'archive', ''));
        // menuItemBlocks.push(menuItem('menu.notification', '#sections/announcements', 'notification', ''));

        if (AP.Config.Data.enableSystemOverview) {
            sysMenus.push(menuItem('sections.system.systemoverview.title', '#sections/system/systemoverview', '', '', ''));
        }
        if (AP.Config.Data.isMultiTenantEnabled) {
            sysMenus.push(menuItem('sections.system.eventsservice.title', '#sections/system/eventsservice', '', '', 'AddModifyRemoveEventServices', false));
        }

        if (AP.Config.Data.isLegacy) {
            applicationmgmtMenus.push(menuItem('sections.processtemplatesmanagement.addtemplate.title', '#sections/processtemplatesmanagement/processtemplates', '', '', 'AddProcessTemplate', '', [], 'AddTemplate')),
                applicationmgmtMenus.push(menuItem('sections.processtemplatesmanagement.processtemplates.title', '#sections/processtemplatesmanagement/processtemplates', '', '', 'ProcessTemplates'))
        }

        return {
            TargetId: 'MainMenu',
            Blocks: [
                {
                    Class: 'SectionsMenu',
                    Name: 'SectionsMenu',
                    Type: 'List',
                    Widget: {
                        Type: 'APCSS3Menu',
                        Config: {
                            orientation: 'vertical',
                            hoverDelay: 400,
                            collapsible: true,
                            lockedCls: 'MenuNotAllowed',
                            items: menuItemBlocks,
                            menuIconSel: '.' + menuIcon.Class
                        }
                    }
                }
            ]


        };
    };
});