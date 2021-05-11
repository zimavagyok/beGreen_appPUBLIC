import { Enumerable } from "linq-es5/lib/enumerable";
import { asEnumerable } from "linq-es5";

declare global
{
    interface NodeList
    {
        toArray(): Node[];
        toEnum() : Enumerable<Node>;
    }

    interface Array<T>
    {
        remove(o: T): void;
        toEnum(): Enumerable<T>;
        toCss(): string;
        insert( index: number, item: T ): T[];
     }

    interface HTMLCollection
    {
        toArray() : Element[];
        toEnum() : Enumerable<Element>
     }

     interface Date
     {
         toStringFromDateStringFromat(): string;
         addHours(hoursToAdd: number): Date;
     }
}

NodeList.prototype.toArray = function () : any[]
{
    const temp = [];
    for (let i = 0; i < this.length; i++) temp.push(this.item(i));
    return temp;
}

NodeList.prototype.toEnum = function ()
{
    return this.toArray().toEnum();
}

Array.prototype.remove = function<T>(o: T)
{
    const index = this.indexOf(o);
    if (index > -1) this.splice(index, 1);
}

Array.prototype.toCss = function ()
{
    return this.join(" ");
}

Array.prototype.toEnum = function ()
{
    return asEnumerable(this);
}

Array.prototype.insert = function<T> ( index: number, item: T )
{
    const array: T[] = this;
    array.splice( index, 0, item );
    return array;
};

HTMLCollection.prototype.toArray = function (): any[]
{
    const temp: Element[] = [];
    for (let i = 0; i < this.length; i++) temp.push(this.item(i) as Element);
    return temp;
}

HTMLCollection.prototype.toEnum = function ()
{
    return this.toArray().toEnum();
}

Date.prototype.toStringFromDateStringFromat = function (): string
{
    if (!(this instanceof Date))
    {
        const result: string = new Date(this).toLocaleDateString();
        return result;
    }
    else
    {
        const result: string = this.toLocaleDateString();
        return result;
    }
}

Date.prototype.addHours = function (hoursToAdd: number): Date
{
    this.setHours(this.getHours() + hoursToAdd);
    return this;
}

export class Extensions {};
