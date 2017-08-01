angular.module('managerApp').directive('contracts', function () {
    "use strict";
    return {
        restrict : 'EA',
        templateUrl: 'components/contracts/contracts.html',
        scope : {
            contracts : '=',
            agree     : '=contractsValidated'
        },
        controller: function () {
            this.disabled = true;
        },
        controllerAs: 'ContractsCtrl',
        bindToController: true,
        link : function ($scope, $elm, $attr, ContractsCtrl) {

            ContractsCtrl.fullText = $attr.fullText === "true" || $attr.fullText === undefined;

            var scrollToOptions = {
                'easing'  : 'swing',
                'duration' : '300',
                'offsetTop'  : '16'
            };

            $scope.$watch(function () {
                return ContractsCtrl.contracts;
            }, function (nv) {
                if (nv !== undefined) {
                    init();
                }
            });

            /**AWESOME SCROLL**/
            var init = function () {

                $elm.find('.contracts-breadcrumb-navigate-previous').unbind('click');
                $elm.find('.contracts-breadcrumb-navigate-next').unbind('click');
                $elm.find('.contracts-list').unbind('scroll');
                $elm.find(".contracts-menu").undelegate('a', 'click');

                var topMenu = $elm.find(".contracts-menu");
                var lastId = 'contract-0';
                var menuItems = topMenu.find("a");
                var scrollItems;
                var initialOffSet;

                ContractsCtrl.currentContract = ContractsCtrl.contracts[0];
                ContractsCtrl.disabled = true;


                //Fake Anchor
                topMenu.delegate('a', 'click', function(e){
                    var href = $(this).attr("data-fake-href");

                    $('.contracts-list').stop().scrollTo(href, scrollToOptions);

                    e.preventDefault();
                });

                $elm.find('.contracts-list').scroll(function (e) {

                    // enable check box
                    var elem = $(e.currentTarget),
                        elemHeight = elem.outerHeight(),
                        elemDiff = elem[0].scrollHeight - elem.scrollTop();

                    if ( (elemDiff === elemHeight) || (elemDiff - elemHeight < 5) ) {
                        $scope.$apply(function () {
                            ContractsCtrl.disabled = false;
                        });
                    }

                    // Get container scroll position
                    var fromTop =  $elm.find('.contracts-list').height()/2 +  $elm.find('.contracts-list').offset().top;

                    if (scrollItems === undefined) {
                        scrollItems = menuItems.map(function() {
                            var item = $($(this).attr("data-fake-href"));
                            if (initialOffSet === undefined) {
                                initialOffSet = item.offset().top;
                            }
                            if (item.length) {
                                return item;
                            }
                        });
                    }

                    // Get id of current scroll item
                    var cur = scrollItems.map(function(){
                        if ($(this).offset().top <= fromTop) {
                            return this;
                        }
                    });

                    // Get the id of the current element
                    cur = cur[cur.length-1];
                    var id = cur && cur.length ? cur[0].id : 'contract-0';
                    if (lastId !== id) {
                        lastId = id;
                        $scope.$apply(function () {
                            ContractsCtrl.currentContract = ContractsCtrl.contracts[id.split('-')[1]];
                        });
                        menuItems.removeClass("active").parent().end().filter("[data-fake-href=#" + id + "]").addClass("active");
                    }
                });

                $elm.find('.contracts-breadcrumb-navigate-previous').click(function () {
                    if (lastId) {
                        $elm.find('.contracts-list').stop().scrollTo('#contract-' + (parseInt(lastId.split('-')[1], 10) - 1), scrollToOptions);
                    }
                });

                $elm.find('.contracts-breadcrumb-navigate-next').click(function () {
                    if (lastId) {
                        $elm.find('.contracts-list').stop().scrollTo('#contract-' + (parseInt(lastId.split('-')[1], 10) + 1), scrollToOptions);
                    }
                });

                menuItems.removeClass("active").parent().end().filter("[data-fake-href=#" + lastId + "]").addClass("active");
                window.setTimeout(function () {
                    $elm.find('.contracts-list').stop().scrollTo(0);
                    menuItems = topMenu.find("a");  // because ngRepeat is not already here ;p
                } ,300);
            };

        }
    };
});
