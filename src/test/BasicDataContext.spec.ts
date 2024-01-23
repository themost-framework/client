import { avg, count, round } from '@themost/query';
import { TestContext } from './TestUtils';
describe("BasicClientDataContext", () => {

  let context: TestContext;
  beforeAll(async () => {
    context = new TestContext();
    await context.authenticate();
  })

  it("should load metadata", async () => {
    const metadata = await context.getMetadata();
    expect(metadata).toBeTruthy();
    expect(metadata.EntityContainer).toBeTruthy();
    expect(metadata.EntityContainer.EntitySet).toBeTruthy();
    const entitySet = metadata.EntityContainer.EntitySet.find((x) => x.Name === "Products");
    expect(entitySet).toBeTruthy();
  });

  it("should use and", async () => {
    const query = context
      .model("Products")
      .asQueryable()
      .select(({ id, name, category, model, price }) => ({
        id,
        name,
        category,
        model,
        price,
      }))
      .where((x: { price: number, category: string }) => {
        return x.price > 500 && x.category === "Laptops";
      })
      .orderByDescending((x: { price: number, category: string }) => x.price)
      .take(10);
    const data: any[] = await query.getItems();
    expect(data.length).toBeTruthy();
  });

  it("should use average", async () => {
    const q = context
      .model("Products")
      .select((x: { price: number, category: string }) => {
        return {
          category: x.category,
          price: round(avg(x.price), 2),
        };
      })
      .groupBy((x: { price: number, category: string }) => x.category);

    const data: any[] = await q.getItems();
    expect(data.length).toBeTruthy();
  });

  it("should use concat", async () => {
    const q = context
      .model("People")
      .select((x: { id: number, familyName: string, givenName: string }) => {
        return {
          id: x.id,
          familyName: x.familyName,
          givenName: x.givenName,
          name: x.givenName.concat(" ", x.familyName),
        };
      })
      .where((x: { id: number, familyName: string, givenName: string }) => {
        return x.givenName.indexOf("Chri") >= 0;
      });

    const data: { id: number, familyName: string, givenName: string, name: string }[] = await q.getItems();
    expect(data.length).toBeTruthy();
    for (const item of data) {
      expect(item.givenName.indexOf("Chri")).toBeGreaterThanOrEqual(0);
      expect(item.name).toEqual(item.givenName.concat(" ", item.familyName));
    }
  });

  it("should throw error", async () => {
    const q = context
      .model("People")
      .select((x: { id: number, familyName1: string, givenName: string }) => {
        return {
          id: x.id,
          familyName1: x.familyName1,
          givenName: x.givenName
        };
      })
      .where((x: { id: number, familyName: string, givenName: string }) => {
        return x.givenName.indexOf("Chri") >= 0;
      });
      await expectAsync(q.getItems()).toBeRejectedWithError('SQLITE_ERROR: no such column: PersonData.familyName1');
  });

  it("should use count", async () => {
    const q = context
      .model("Orders")
      .select((x: { id: number, orderStatus: { alternateName: string } }) => {
        const name = x.orderStatus.alternateName;
        const total = count(x.id);
        return {
          name,
          total,
        };
      })
      .where((x: { orderedItem: { category: string } }) => x.orderedItem.category === "Laptops")
      .groupBy((x: { orderStatus: { alternateName: string } }) => x.orderStatus.alternateName);
    const data: {name: string, total: number}[] = await q.getItems();
    expect(data.length).toBeTruthy();
    expect(data[0].total).toBeTruthy();
  });

  it("should use insert", async () => {
    const product = {
      name: "Acer New Gaming Laptop 17",
      model: "AC1705",
      price: 989.5,
      releaseDate: new Date(),
    };
    await context.model("Products").insert(product);
    const q = context
      .model("Products")
      .asQueryable()
      .select(({ id, name, model, price, dateCreated }) => ({
        id,
        name,
        model,
        price,
        dateCreated
      }))
      .where((x: { model: string }) => {
        return x.model === "AC1705";
      });
    let item: { id: number, name: string, model: string, price: number, dateCreated: Date } = await q.getItem();
    expect(item).toBeTruthy();
    expect(item.id).toBeTruthy();
    expect(item.dateCreated).toBeInstanceOf(Date);
    await context.model("Products").remove(product);
    item = await q.getItem();
    expect(item).toBeFalsy();
  });

});
