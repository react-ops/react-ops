import "jest";
import {
    LocalFileSystem,    
} from "../LocalFileSystem";
import {
    IFolder 
} from "../../index.d";

describe("utils/LocalFileSystem", () => {

    let fs: LocalFileSystem;

    beforeEach(() => {
        fs = new LocalFileSystem(__dirname);
    })

    it("mkdir", async () => {

        expect.assertions(12);

        expect(await fs.mkdir("/")).not.toBeUndefined();
        // expect(await fs.mkdir("")).path.toEqual("/");

        // // create
        // expect(fs.root.children["A"]).toBeUndefined();
        // const A = await fs.mkdir("/A");
        // expect(fs.root.children["A"]).not.toBeUndefined();
        // expect(A.path).toEqual("A");
        // expect(A.parent).toBe(fs.root);
        // expect(A).toBe(fs.root.children["A"]);

        // // deep

        // const D = await fs.mkdir("/A/B/C/D");
        // expect(A).toBe(fs.root.children["A"]);
        // expect(A.children["B"]).not.toBeUndefined();
        // const B = A.children["B"] as IFolder;
        // expect(B.children["C"]).not.toBeUndefined();
        // const C = B.children["C"] as IFolder;
        // expect(C.children["D"]).not.toBeUndefined();

        // // error
        // const E = await fs.writeAsString("/A/B/E", "", "utf8");
        // try {
        //     await fs.mkdir("A/B/E");
        // } catch(e) {
        //     expect(e).not.toBeNull();
        // }
                
    });

    it("exists", async () => {

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "", "utf8");

        expect(await fs.exists("/")).toEqual(true);
        expect(await fs.exists("")).toEqual(true);

        expect(await fs.exists("/A")).toEqual(true);
        expect(await fs.exists("/A/B")).toEqual(true);
        expect(await fs.exists("/A/B/C")).toEqual(true);
        expect(await fs.exists("/A/B/C/D")).toEqual(true);
        expect(await fs.exists("/A/B/E")).toEqual(true);
        

        expect(await fs.exists("/B")).toEqual(false);
        expect(await fs.exists("/C")).toEqual(false);
        expect(await fs.exists("/C/D")).toEqual(false);
        expect(await fs.exists("/E")).toEqual(false);
        expect(await fs.exists("/D")).toEqual(false);
        expect(await fs.exists("/A/B/E/Z")).toEqual(false);
                
    });

    it("isDir", async () => {

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "", "utf8");

        expect(await fs.isDir("/A")).toEqual(true);
        expect(await fs.isDir("/A/B")).toEqual(true);
        expect(await fs.isDir("/A/B/C")).toEqual(true);
        expect(await fs.isDir("/A/B/C/D")).toEqual(true);
        expect(await fs.isDir("/A/B/E")).toEqual(false);

        expect(await fs.isDir("/B")).toEqual(false);
        expect(await fs.isDir("/C")).toEqual(false);
        expect(await fs.isDir("/C/D")).toEqual(false);
        expect(await fs.isDir("/E")).toEqual(false);
        expect(await fs.isDir("/D")).toEqual(false);
                
    });

    it("isFile", async () => {

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "", "utf8");

        expect(await fs.isFile("/")).toEqual(false);
        expect(await fs.isFile("/A")).toEqual(false);
        expect(await fs.isFile("/A/B")).toEqual(false);
        expect(await fs.isFile("/A/B/C")).toEqual(false);
        expect(await fs.isFile("/A/B/C/D")).toEqual(false);
        expect(await fs.isFile("/A/B/E")).toEqual(true);

        expect(await fs.isFile("/B")).toEqual(false);
        expect(await fs.isFile("/C")).toEqual(false);
        expect(await fs.isFile("/C/D")).toEqual(false);
        expect(await fs.isFile("/E")).toEqual(false);
        expect(await fs.isFile("/D")).toEqual(false);
                
    });

    it("readAsString", async () => {

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "heloł łorld", "utf8");

        expect(await fs.readAsString("/")).toBeUndefined();
        expect(await fs.readAsString("/A")).toBeUndefined();
        expect(await fs.readAsString("/A/B")).toBeUndefined();
        expect(await fs.readAsString("/A/B/C")).toBeUndefined();
        expect(await fs.readAsString("/A/B/C/D")).toBeUndefined();
        expect(await fs.readAsString("/A/B/E")).toEqual("heloł łorld");

        expect(await fs.readAsString("/B")).toBeUndefined();
        expect(await fs.readAsString("/C")).toBeUndefined();
        expect(await fs.readAsString("/C/D")).toBeUndefined();
        expect(await fs.readAsString("/E")).toBeUndefined();
        expect(await fs.readAsString("/D")).toBeUndefined();
                
    });

    it("writeAsString", async () => {

        expect.assertions(8);

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "heloł łorld", "utf8");

        expect(await fs.readAsString("/A/B/E")).toEqual("heloł łorld");
        expect(E.content).toEqual("heloł łorld");
        expect(await fs.get("/A/B")).toEqual(E.parent);

        const Z = await fs.writeAsString("/A/B/E", "not wery łelkom", "utf8");

        expect(await fs.readAsString("/A/B/E")).toEqual("not wery łelkom");
        expect(E.content).toEqual("not wery łelkom");
        expect(await fs.get("/A/B")).toEqual(E.parent);
        expect(Z).toEqual(E);

        try {
            await fs.writeAsString("/A/B", "a", "utf8");
        } catch(e) {
            expect(e).not.toBeNull();
        }

                
    });

    it("delete", async () => {

        const D = await fs.mkdir("/A/B/C/D");
        const E = await fs.writeAsString("/A/B/E", "", "utf8");

        expect(await fs.delete("/A/B")).toEqual(true);
        expect(await fs.delete("/A/B/C")).toEqual(false)

        expect(await fs.exists("/A")).toEqual(true);
        expect(await fs.exists("/A/B")).toEqual(false);
        expect(await fs.exists("/A/B/C")).toEqual(false);
        expect(await fs.exists("/A/B/C/D")).toEqual(false);
        expect(await fs.exists("/A/B/E")).toEqual(false);

        expect(await fs.exists("/B")).toEqual(false);
        expect(await fs.exists("/C")).toEqual(false);
        expect(await fs.exists("/C/D")).toEqual(false);
        expect(await fs.exists("/E")).toEqual(false);
        expect(await fs.exists("/D")).toEqual(false);
                
    });

    afterEach(() => {
        fs = null;
    })

});
