walletApp.directive('onDocumentClick', ($document) ->
	{
		restrict: 'A',
		link: (scope, elem, attrs) ->
			onClick = () ->
				scope.$apply () ->
					scope.$eval attrs.onDocumentClick

			$document.on 'click', onClick

			scope.$on '$destroy', () ->
				$document.off 'click', onClick
	}
)