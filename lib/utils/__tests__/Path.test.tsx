import "jest";
import {
    absolutePath,
    pathToSegments
} from "../Path";

describe("utils/Path", () => {

    it("absolutePath", () => {

        const a = {
            path: "a",
            parent: null
        };
        const b = {
            path: "b",
            parent: a
        }
        const c = {
            path: "a",
            parent: a
        }
        const d = {
            path: "z",
            parent: c
        }

        expect(absolutePath(null)).toBeNull();
        expect(absolutePath(a)).toEqual("/a")
        expect(absolutePath(b)).toEqual("/a/b")
        expect(absolutePath(c)).toEqual("/a/a")
        expect(absolutePath(d)).toEqual("/a/a/z")
    });

    it("pathToSegments", () => {

        expect(pathToSegments(null)).toEqual([]);
        expect(pathToSegments("a")).toEqual(["a"]);
        expect(pathToSegments("/a")).toEqual(["a"]);
        expect(pathToSegments("/a/b")).toEqual(["a", "b"]);
        expect(pathToSegments("/a//b")).toEqual(["a", "b"]);
        expect(pathToSegments("/a/0/b")).toEqual(["a", "0", "b"]);
    });

});
