import { SMAAImageLoader } from "postprocessing";
import { LoadingManager } from "three";

/**
 * Loads scene assets.
 *
 * @return {Promise} A promise that returns a collection of assets.
 */

export function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const smaaImageLoader = new SMAAImageLoader(loadingManager);

	return new Promise((resolve, reject) => {

		loadingManager.onError = reject;
		loadingManager.onLoad = () => resolve(assets);

		smaaImageLoader.load(([search, area]) => {

			assets.set("smaa-search", search);
			assets.set("smaa-area", area);

		});

	});

}
